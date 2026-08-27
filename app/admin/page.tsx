'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import { ADMIN_EMAIL, getFirebaseServices } from '../firebase';
import { questions as seedQuestions, type Question } from '../questions';

type ManagedQuestion = Question & {
  published: boolean;
};

type Role = 'viewer' | 'editor' | 'admin';

type Membership = {
  email: string;
  name: string;
  role: Role;
  active: boolean;
};

const roleOptions: { value: Role; label: string; description: string }[] = [
  { value: 'viewer', label: '檢視者', description: '可登入後台並讀取全部題目與草稿。' },
  { value: 'editor', label: '編輯者', description: '可讀取、新增、修改與發布題目，但不能刪除或管理成員。' },
  { value: 'admin', label: '管理員', description: '擁有完整題庫與成員權限管理能力。' },
];

const roleLabel = (role: Role) => roleOptions.find((item) => item.value === role)?.label ?? role;
const normalizeEmail = (email: string) => email.trim().toLowerCase();

const difficultyOptions: Question['difficulty'][] = ['基礎', '中等', '進階'];
const answerOptions = ['A', 'B', 'C', 'D'] as const;

const makeBlankQuestion = (): ManagedQuestion => ({
  id: '',
  year: 115,
  number: 1,
  chapter: '生態',
  topic: '',
  skill: '概念辨識',
  difficulty: '基礎',
  answer: 'A',
  summary: '',
  insight: '',
  trap: '',
  prompt: '',
  options: answerOptions.map((label) => ({ label, text: '' })),
  hasVisualMaterial: false,
  passRate: null,
  errorRate: null,
  statisticalDifficulty: '待統計',
  rateStatus: '尚未取得',
  rateSource: null,
  rateAnalysis: '目前未取得公開的全國逐題通過率，暫不判定統計難度。',
  published: true,
});

const getRateFields = (passRate: number | null) => {
  const errorRate = passRate === null ? null : Number((1 - passRate).toFixed(4));
  const statisticalDifficulty: Question['statisticalDifficulty'] = errorRate === null ? '待統計' : errorRate < 0.25 ? '低' : errorRate <= 0.45 ? '中' : '高';
  const rateAnalysis = errorRate === null
    ? '目前未取得公開的全國逐題通過率，暫不判定統計難度。'
    : errorRate < 0.25
      ? '多數考生能正確作答，可作為基礎概念與快速複習題。'
      : errorRate <= 0.45
        ? '具有一定鑑別度，建議留意題幹轉譯、圖表判讀與概念連結。'
        : '全國答錯率偏高，建議列為優先精讀題，並回看常見誤區。';

  return {
    passRate,
    errorRate,
    statisticalDifficulty,
    rateStatus: passRate === null ? '尚未取得' as const : '全國統計' as const,
    rateAnalysis,
  };
};

const firebaseError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('unauthorized-domain')) return '目前網域尚未獲得 Firebase 登入授權。';
  if (message.includes('permission-denied')) return '這個帳號沒有資料庫管理權限。';
  if (message.includes('popup-closed')) return '登入視窗已關閉，尚未完成登入。';
  if (message.includes('member-disabled')) return '這個後台帳號目前已停用。';
  if (message.includes('member-not-authorized')) return '這個 Google 帳號尚未加入後台成員名單。';
  return `操作失敗：${message}`;
};

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [records, setRecords] = useState<ManagedQuestion[]>([]);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState<ManagedQuestion | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [membership, setMembership] = useState<Membership | null>(null);
  const [members, setMembers] = useState<Membership[]>([]);
  const [panel, setPanel] = useState<'questions' | 'members'>('questions');
  const [memberForm, setMemberForm] = useState<Membership>({ email: '', name: '', role: 'viewer', active: true });
  const [editingMemberEmail, setEditingMemberEmail] = useState<string | null>(null);

  const isAdmin = membership?.role === 'admin';
  const canEdit = membership?.role === 'editor' || isAdmin;

  const loadQuestions = async () => {
    const { db } = getFirebaseServices();
    const snapshot = await getDocs(collection(db, 'questions'));
    const next = snapshot.docs
      .map((item) => ({ ...item.data(), id: item.id } as ManagedQuestion))
      .sort((a, b) => b.year - a.year || a.number - b.number);
    setRecords(next);
  };

  const loadMembers = async () => {
    const { db } = getFirebaseServices();
    const snapshot = await getDocs(collection(db, 'members'));
    const next = snapshot.docs
      .map((item) => item.data() as Membership)
      .filter((item) => normalizeEmail(item.email) !== ADMIN_EMAIL);
    next.unshift({ email: ADMIN_EMAIL, name: '主要管理員', role: 'admin', active: true });
    setMembers(next.sort((a, b) => a.role.localeCompare(b.role) || a.email.localeCompare(b.email)));
  };

  const resolveMembership = async (nextUser: User): Promise<Membership> => {
    const email = normalizeEmail(nextUser.email ?? '');
    if (email === ADMIN_EMAIL) {
      return { email, name: nextUser.displayName ?? '主要管理員', role: 'admin', active: true };
    }
    const { db } = getFirebaseServices();
    const snapshot = await getDoc(doc(db, 'members', email));
    if (!snapshot.exists()) throw new Error('member-not-authorized');
    const member = snapshot.data() as Membership;
    if (!member.active) throw new Error('member-disabled');
    return { ...member, email };
  };

  useEffect(() => {
    const { auth } = getFirebaseServices();
    return onAuthStateChanged(auth, async (nextUser) => {
      setError('');
      if (!nextUser) {
        setUser(null);
        setMembership(null);
        setAuthReady(true);
        return;
      }

      try {
        const nextMembership = await resolveMembership(nextUser);
        setUser(nextUser);
        setMembership(nextMembership);
        await loadQuestions();
        if (nextMembership.role === 'admin') await loadMembers();
      } catch (loadError) {
        await signOut(auth);
        setUser(null);
        setMembership(null);
        setError(firebaseError(loadError));
      } finally {
        setAuthReady(true);
      }
    });
  }, []);

  const filteredRecords = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return records;
    return records.filter((item) => `${item.id} ${item.year} ${item.number} ${item.chapter} ${item.topic} ${item.prompt}`.toLowerCase().includes(keyword));
  }, [query, records]);

  const signIn = async () => {
    setBusy(true);
    setError('');
    try {
      const { auth } = getFirebaseServices();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (signInError) {
      setError(firebaseError(signInError));
    } finally {
      setBusy(false);
    }
  };

  const beginCreate = () => {
    if (!canEdit) return;
    setEditingId(null);
    setForm(makeBlankQuestion());
    setNotice('');
    setError('');
  };

  const beginEdit = (question: ManagedQuestion) => {
    if (!canEdit) return;
    setEditingId(question.id);
    setForm({ ...question, options: question.options.map((option) => ({ ...option })) });
    setNotice('');
    setError('');
  };

  const importSeedQuestions = async () => {
    if (!user || !canEdit) return;
    const existingIds = new Set(records.map((item) => item.id));
    const missing = seedQuestions.filter((item) => !existingIds.has(item.id));
    if (!missing.length) {
      setNotice('既有 45 題已全部存在，沒有覆寫任何資料。');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const { db } = getFirebaseServices();
      const batch = writeBatch(db);
      missing.forEach((question) => {
        batch.set(doc(db, 'questions', question.id), {
          ...question,
          options: question.options.map((option) => ({ ...option })),
          published: true,
          updatedAt: serverTimestamp(),
          updatedBy: user.email,
        });
      });
      await batch.commit();
      await loadQuestions();
      setNotice(`已匯入 ${missing.length} 題；既有資料均保留不覆寫。`);
    } catch (importError) {
      setError(firebaseError(importError));
    } finally {
      setBusy(false);
    }
  };

  const saveQuestion = async (event: FormEvent) => {
    event.preventDefault();
    if (!form || !user || !canEdit) return;
    if (!/^\d{3}-\d+$/.test(form.id.trim())) {
      setError('題目 ID 請使用「年度-題號」，例如 115-6。');
      return;
    }
    if (!form.topic.trim() || !form.prompt.trim() || form.options.some((option) => !option.text.trim())) {
      setError('請填寫主題、題幹及四個選項。');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const { db } = getFirebaseServices();
      const normalizedPassRate = form.passRate === null ? null : Math.min(1, Math.max(0, form.passRate));
      const payload = {
        ...form,
        id: form.id.trim(),
        topic: form.topic.trim(),
        prompt: form.prompt.trim(),
        options: form.options.map((option) => ({ ...option, text: option.text.trim() })),
        ...getRateFields(normalizedPassRate),
        updatedAt: serverTimestamp(),
        updatedBy: user.email,
      };
      await setDoc(doc(db, 'questions', payload.id), payload);
      await loadQuestions();
      setForm(null);
      setEditingId(null);
      setNotice(`已儲存 ${payload.year} 年第 ${payload.number} 題。`);
    } catch (saveError) {
      setError(firebaseError(saveError));
    } finally {
      setBusy(false);
    }
  };

  const removeQuestion = async (question: ManagedQuestion) => {
    if (!user || !isAdmin || !window.confirm(`確定刪除 ${question.year} 年第 ${question.number} 題嗎？此操作無法復原。`)) return;
    setBusy(true);
    setError('');
    try {
      const { db } = getFirebaseServices();
      await deleteDoc(doc(db, 'questions', question.id));
      await loadQuestions();
      if (editingId === question.id) setForm(null);
      setNotice(`已刪除 ${question.id}。`);
    } catch (deleteError) {
      setError(firebaseError(deleteError));
    } finally {
      setBusy(false);
    }
  };

  const resetMemberForm = () => {
    setEditingMemberEmail(null);
    setMemberForm({ email: '', name: '', role: 'viewer', active: true });
  };

  const editMember = (member: Membership) => {
    if (!isAdmin || normalizeEmail(member.email) === ADMIN_EMAIL) return;
    setEditingMemberEmail(normalizeEmail(member.email));
    setMemberForm({ ...member, email: normalizeEmail(member.email) });
    setNotice('');
    setError('');
  };

  const saveMember = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !isAdmin) return;
    const email = normalizeEmail(memberForm.email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('請輸入有效的 Google 帳號電子郵件。');
      return;
    }
    if (email === ADMIN_EMAIL) {
      setError('主要管理員帳號的最高權限由系統保留。');
      return;
    }
    if (email === normalizeEmail(user.email ?? '')) {
      setError('不能在目前登入期間修改自己的權限。');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const { db } = getFirebaseServices();
      await setDoc(doc(db, 'members', email), {
        email,
        name: memberForm.name.trim(),
        role: memberForm.role,
        active: memberForm.active,
        ...(editingMemberEmail ? {} : { createdAt: serverTimestamp() }),
        updatedAt: serverTimestamp(),
        updatedBy: user.email,
      }, { merge: true });
      await loadMembers();
      resetMemberForm();
      setNotice(`已儲存 ${email} 的「${roleLabel(memberForm.role)}」權限。`);
    } catch (memberError) {
      setError(firebaseError(memberError));
    } finally {
      setBusy(false);
    }
  };

  const removeMember = async (member: Membership) => {
    const email = normalizeEmail(member.email);
    if (!user || !isAdmin || email === ADMIN_EMAIL || email === normalizeEmail(user.email ?? '')) return;
    if (!window.confirm(`確定移除 ${email} 的後台權限嗎？`)) return;
    setBusy(true);
    setError('');
    try {
      const { db } = getFirebaseServices();
      await deleteDoc(doc(db, 'members', email));
      await loadMembers();
      if (editingMemberEmail === email) resetMemberForm();
      setNotice(`已移除 ${email} 的後台權限。`);
    } catch (memberError) {
      setError(firebaseError(memberError));
    } finally {
      setBusy(false);
    }
  };

  if (!authReady) {
    return <main className="flex min-h-screen items-center justify-center bg-[#eef4f9] text-[#42566c]"><p className="rounded-2xl bg-white px-6 py-4 shadow-sm">正在確認管理權限…</p></main>;
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,#dcefff_0,transparent_32rem),linear-gradient(180deg,#f7fafe,#eaf1f7)] px-5 text-[#132238]">
        <section className="w-full max-w-lg rounded-[2rem] border border-white bg-white/95 p-7 shadow-[0_28px_80px_rgba(23,59,92,.14)] sm:p-10">
          <a href="./" className="text-sm font-black text-[#0b6bcb]">← 返回學生網站</a>
          <div className="mt-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0b6bcb] font-black text-white">DB</div>
          <p className="mt-6 text-xs font-black tracking-[0.16em] text-[#0b6bcb]">CONTENT ADMIN</p>
          <h1 className="mt-2 text-3xl font-black">題庫內容管理後台</h1>
          <p className="mt-4 leading-7 text-[#5e7185]">使用已加入成員名單的 Google 帳號登入，系統會依照檢視者、編輯者或管理員角色開放功能。</p>
          {error && <p role="alert" className="mt-5 rounded-xl bg-[#fff0eb] px-4 py-3 text-sm font-bold text-[#9b3f22]">{error}</p>}
          <button type="button" onClick={signIn} disabled={busy} className="mt-7 w-full rounded-xl bg-[#0b6bcb] px-5 py-3.5 font-black text-white shadow-sm transition hover:bg-[#095aa9] disabled:opacity-50">{busy ? '登入中…' : '使用 Google 管理員帳號登入'}</button>
          <p className="mt-4 text-center text-xs text-[#7b8ea1]">主要管理員：{ADMIN_EMAIL}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef4f9] text-[#132238]">
      <header className="sticky top-0 z-20 border-b border-[#d7e2ec] bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-3 px-5 py-4 lg:px-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b6bcb] text-xs font-black text-white">DB</div>
          <div><p className="text-[10px] font-black tracking-[0.14em] text-[#0b6bcb]">CONTENT ADMIN</p><h1 className="font-black">會考生物題庫管理</h1></div>
          {membership && <span className="rounded-full bg-[#e8f2fc] px-3 py-1.5 text-xs font-black text-[#0b6bcb]">{roleLabel(membership.role)}</span>}
          <div className="ml-auto flex items-center gap-2"><a href="./" className="rounded-xl border border-[#cad7e4] px-3 py-2 text-xs font-black text-[#42566c]">查看網站 ↗</a><button type="button" onClick={() => signOut(getFirebaseServices().auth)} className="rounded-xl bg-[#edf2f7] px-3 py-2 text-xs font-black text-[#52677c]">登出</button></div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-5 px-5 py-6 lg:grid-cols-[290px_minmax(0,1fr)] lg:px-8">
        <aside className="space-y-4">
          <section className="rounded-3xl bg-[#102f4f] p-5 text-white shadow-lg">
            <p className="text-xs text-[#b8ccde]">已登入 · {membership ? roleLabel(membership.role) : ''}</p><strong className="mt-1 block break-all text-sm">{user.email}</strong>
            <div className="mt-5 grid grid-cols-2 gap-2"><div className="rounded-xl bg-white/10 p-3"><b className="block text-2xl">{records.length}</b><span className="text-xs text-[#cbd9e5]">資料庫題數</span></div><div className="rounded-xl bg-white/10 p-3"><b className="block text-2xl">{records.filter((item) => item.published).length}</b><span className="text-xs text-[#cbd9e5]">已發布</span></div></div>
          </section>
          <button type="button" onClick={() => setPanel('questions')} className={`w-full rounded-xl px-4 py-3 text-sm font-black ${panel === 'questions' ? 'bg-[#0b6bcb] text-white' : 'border border-[#cad7e4] bg-white text-[#42566c]'}`}>題目內容</button>
          {isAdmin && <button type="button" onClick={() => { setPanel('members'); setNotice(''); setError(''); }} className={`w-full rounded-xl px-4 py-3 text-sm font-black ${panel === 'members' ? 'bg-[#0b6bcb] text-white' : 'border border-[#cad7e4] bg-white text-[#42566c]'}`}>成員與權限</button>}
          {canEdit && panel === 'questions' && <><button type="button" onClick={beginCreate} className="w-full rounded-xl bg-[#0b6bcb] px-4 py-3 text-sm font-black text-white shadow-sm">＋ 新增題目</button><button type="button" onClick={importSeedQuestions} disabled={busy} className="w-full rounded-xl border border-[#97bddd] bg-white px-4 py-3 text-sm font-black text-[#0b6bcb] disabled:opacity-50">匯入缺少的既有 45 題</button></>}
          <p className="rounded-xl bg-[#e7f8f1] p-3 text-xs leading-5 text-[#23634f]">{membership?.role === 'viewer' ? '目前為檢視權限：可閱讀全部題目與草稿，不能修改資料。' : membership?.role === 'editor' ? '目前為編輯權限：可新增、修改與發布題目，不能刪除或管理成員。' : '目前為管理員權限：可管理題庫、刪除資料及設定成員角色。'}</p>
        </aside>

        <section className="min-w-0">
          {panel === 'questions' ? <div className="rounded-3xl border border-white bg-white p-5 shadow-[0_14px_38px_rgba(26,64,101,.07)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center"><div><p className="text-xs font-black tracking-[0.14em] text-[#0b6bcb]">FIRESTORE</p><h2 className="text-xl font-black">題目內容</h2></div><label className="sm:ml-auto sm:w-80"><span className="sr-only">搜尋後台題目</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋年度、題號、章節或題幹…" className="w-full rounded-xl border border-[#cad7e4] px-4 py-2.5 text-sm outline-none focus:border-[#0b6bcb]" /></label></div>
            {notice && <p role="status" className="mt-4 rounded-xl bg-[#e7f8f1] px-4 py-3 text-sm font-bold text-[#23634f]">{notice}</p>}
            {error && <p role="alert" className="mt-4 rounded-xl bg-[#fff0eb] px-4 py-3 text-sm font-bold text-[#9b3f22]">{error}</p>}
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left text-sm">
                <thead className="text-xs text-[#71859a]"><tr><th className="px-3">題目</th><th className="px-3">章節／主題</th><th className="px-3">統計</th><th className="px-3">狀態</th><th className="px-3 text-right">操作</th></tr></thead>
                <tbody>{filteredRecords.map((question) => <tr key={question.id} className="bg-[#f7fafc]"><td className="rounded-l-xl px-3 py-3 font-black">{question.year} 年<br /><span className="text-xs text-[#6e8296]">第 {question.number} 題 · {question.id}</span></td><td className="max-w-[330px] px-3 py-3"><span className="text-xs font-bold text-[#0b6bcb]">{question.chapter}</span><strong className="block truncate">{question.topic}</strong></td><td className="px-3 py-3 text-xs">答錯率<br /><b>{question.errorRate === null ? '待統計' : `${(question.errorRate * 100).toFixed(1)}%`}</b></td><td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-black ${question.published ? 'bg-[#e0f5ed] text-[#08765a]' : 'bg-[#e9edf1] text-[#607387]'}`}>{question.published ? '已發布' : '草稿'}</span></td><td className="rounded-r-xl px-3 py-3 text-right">{canEdit ? <button type="button" onClick={() => beginEdit(question)} className="rounded-lg bg-white px-3 py-2 text-xs font-black text-[#0b6bcb] shadow-sm">編輯</button> : <span className="text-xs font-bold text-[#71859a]">僅供檢視</span>}{isAdmin && <button type="button" onClick={() => removeQuestion(question)} className="ml-2 rounded-lg px-3 py-2 text-xs font-black text-[#b44725]">刪除</button>}</td></tr>)}</tbody>
              </table>
              {!filteredRecords.length && <p className="py-12 text-center text-sm text-[#71859a]">目前沒有符合條件的題目。</p>}
            </div>
          </div> : <div className="space-y-5">
            <section className="rounded-3xl border border-white bg-white p-5 shadow-[0_14px_38px_rgba(26,64,101,.07)] sm:p-6">
              <div><p className="text-xs font-black tracking-[0.14em] text-[#0b6bcb]">ACCESS CONTROL</p><h2 className="text-xl font-black">成員與權限</h2><p className="mt-2 text-sm leading-6 text-[#66788a]">以 Google 帳號電子郵件建立成員；使用者首次登入時即套用指定角色。</p></div>
              {notice && <p role="status" className="mt-4 rounded-xl bg-[#e7f8f1] px-4 py-3 text-sm font-bold text-[#23634f]">{notice}</p>}
              {error && <p role="alert" className="mt-4 rounded-xl bg-[#fff0eb] px-4 py-3 text-sm font-bold text-[#9b3f22]">{error}</p>}
              <div className="mt-5 grid gap-3 md:grid-cols-3">{roleOptions.map((item) => <div key={item.value} className="rounded-2xl border border-[#dbe5ed] bg-[#f8fafc] p-4"><strong className="text-sm">{item.label}</strong><p className="mt-2 text-xs leading-5 text-[#66788a]">{item.description}</p></div>)}</div>
            </section>

            <form onSubmit={saveMember} className="rounded-3xl border border-white bg-white p-5 shadow-[0_14px_38px_rgba(26,64,101,.07)] sm:p-6">
              <div className="flex items-center justify-between"><div><p className="text-xs font-black tracking-[0.14em] text-[#0b6bcb]">MEMBER</p><h3 className="text-lg font-black">{editingMemberEmail ? '修改成員權限' : '新增後台成員'}</h3></div>{editingMemberEmail && <button type="button" onClick={resetMemberForm} className="rounded-lg bg-[#edf2f7] px-3 py-2 text-xs font-black text-[#52677c]">取消修改</button>}</div>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <label className="text-xs font-black text-[#52677c] xl:col-span-2">Google 帳號電子郵件<input type="email" disabled={Boolean(editingMemberEmail)} value={memberForm.email} onChange={(event) => setMemberForm({ ...memberForm, email: event.target.value })} placeholder="teacher@example.com" className="mt-2 w-full rounded-xl border border-[#cad7e4] px-3 py-2.5 text-sm disabled:bg-[#edf2f7]" /></label>
                <label className="text-xs font-black text-[#52677c]">顯示名稱<input value={memberForm.name} onChange={(event) => setMemberForm({ ...memberForm, name: event.target.value })} placeholder="王老師" className="mt-2 w-full rounded-xl border border-[#cad7e4] px-3 py-2.5 text-sm" /></label>
                <label className="text-xs font-black text-[#52677c]">權限角色<select value={memberForm.role} onChange={(event) => setMemberForm({ ...memberForm, role: event.target.value as Role })} className="mt-2 w-full rounded-xl border border-[#cad7e4] px-3 py-2.5 text-sm">{roleOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3"><label className="flex items-center gap-2 rounded-xl bg-[#f5f8fb] px-4 py-3 text-sm font-black"><input type="checkbox" checked={memberForm.active} onChange={(event) => setMemberForm({ ...memberForm, active: event.target.checked })} />啟用此帳號</label><button type="submit" disabled={busy} className="rounded-xl bg-[#0b6bcb] px-5 py-3 text-sm font-black text-white disabled:opacity-50">{busy ? '儲存中…' : editingMemberEmail ? '更新權限' : '新增成員'}</button></div>
            </form>

            <section className="rounded-3xl border border-white bg-white p-5 shadow-[0_14px_38px_rgba(26,64,101,.07)] sm:p-6">
              <div className="flex items-center justify-between"><div><p className="text-xs font-black tracking-[0.14em] text-[#0b6bcb]">MEMBER LIST</p><h3 className="text-lg font-black">已授權成員</h3></div><span className="rounded-full bg-[#edf5fc] px-3 py-1.5 text-xs font-black text-[#0b6bcb]">{members.length} 人</span></div>
              <div className="mt-5 space-y-3">{members.map((member) => { const email = normalizeEmail(member.email); const locked = email === ADMIN_EMAIL || email === normalizeEmail(user.email ?? ''); return <article key={email} className="flex flex-col gap-3 rounded-2xl border border-[#dbe5ed] bg-[#f8fafc] p-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><strong>{member.name || email}</strong><span className={`rounded-full px-2.5 py-1 text-xs font-black ${member.role === 'admin' ? 'bg-[#e8f2fc] text-[#0b6bcb]' : member.role === 'editor' ? 'bg-[#e7f8f1] text-[#08765a]' : 'bg-[#edf0f3] text-[#607387]'}`}>{roleLabel(member.role)}</span><span className={`rounded-full px-2.5 py-1 text-xs font-black ${member.active ? 'bg-white text-[#08765a]' : 'bg-[#fff0eb] text-[#9b3f22]'}`}>{member.active ? '啟用' : '停用'}</span></div><p className="mt-1 break-all text-xs text-[#66788a]">{email}</p></div><div className="flex gap-2">{locked ? <span className="px-3 py-2 text-xs font-bold text-[#71859a]">{email === ADMIN_EMAIL ? '主要管理員' : '目前帳號'}</span> : <><button type="button" onClick={() => editMember(member)} className="rounded-lg bg-white px-3 py-2 text-xs font-black text-[#0b6bcb] shadow-sm">修改</button><button type="button" onClick={() => removeMember(member)} className="rounded-lg px-3 py-2 text-xs font-black text-[#b44725]">移除</button></>}</div></article>; })}</div>
            </section>
          </div>}
        </section>
      </div>

      {form && <div className="fixed inset-0 z-40 flex justify-end bg-[#071a2e]/65 backdrop-blur-sm" onMouseDown={(event) => { if (event.currentTarget === event.target) setForm(null); }}>
        <form onSubmit={saveQuestion} className="h-full w-full max-w-3xl overflow-y-auto bg-white shadow-2xl">
          <header className="sticky top-0 z-10 flex items-center border-b border-[#e0e8ef] bg-white/95 px-5 py-4 backdrop-blur sm:px-7"><div><p className="text-xs font-black tracking-[0.12em] text-[#0b6bcb]">QUESTION EDITOR</p><h2 className="text-xl font-black">{editingId ? `編輯 ${editingId}` : '新增題目'}</h2></div><button type="button" onClick={() => setForm(null)} aria-label="關閉題目編輯器" className="ml-auto h-10 w-10 rounded-full bg-[#edf2f7] text-xl">×</button></header>
          <div className="space-y-6 px-5 py-6 sm:px-7">
            <section className="grid gap-4 rounded-2xl bg-[#f5f8fb] p-4 sm:grid-cols-4">
              <label className="text-xs font-black text-[#52677c]">題目 ID<input disabled={Boolean(editingId)} value={form.id} onChange={(event) => setForm({ ...form, id: event.target.value })} placeholder="115-6" className="mt-2 w-full rounded-xl border border-[#cad7e4] bg-white px-3 py-2.5 text-sm disabled:bg-[#e9eef3]" /></label>
              <label className="text-xs font-black text-[#52677c]">年度<input type="number" value={form.year} onChange={(event) => setForm({ ...form, year: Number(event.target.value) })} className="mt-2 w-full rounded-xl border border-[#cad7e4] bg-white px-3 py-2.5 text-sm" /></label>
              <label className="text-xs font-black text-[#52677c]">題號<input type="number" value={form.number} onChange={(event) => setForm({ ...form, number: Number(event.target.value) })} className="mt-2 w-full rounded-xl border border-[#cad7e4] bg-white px-3 py-2.5 text-sm" /></label>
              <label className="flex items-center gap-2 self-end rounded-xl bg-white px-3 py-3 text-sm font-black"><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} />發布到學生網站</label>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-black text-[#52677c]">章節<input value={form.chapter} onChange={(event) => setForm({ ...form, chapter: event.target.value })} className="mt-2 w-full rounded-xl border border-[#cad7e4] px-3 py-2.5 text-sm" /></label>
              <label className="text-xs font-black text-[#52677c]">主題<input value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })} className="mt-2 w-full rounded-xl border border-[#cad7e4] px-3 py-2.5 text-sm" /></label>
              <label className="text-xs font-black text-[#52677c]">評量能力<input value={form.skill} onChange={(event) => setForm({ ...form, skill: event.target.value })} className="mt-2 w-full rounded-xl border border-[#cad7e4] px-3 py-2.5 text-sm" /></label>
              <label className="text-xs font-black text-[#52677c]">教學難度<select value={form.difficulty} onChange={(event) => setForm({ ...form, difficulty: event.target.value as Question['difficulty'] })} className="mt-2 w-full rounded-xl border border-[#cad7e4] px-3 py-2.5 text-sm">{difficultyOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
            </section>

            <label className="block text-xs font-black text-[#52677c]">完整題幹<textarea rows={5} value={form.prompt} onChange={(event) => setForm({ ...form, prompt: event.target.value })} className="mt-2 w-full rounded-xl border border-[#cad7e4] px-3 py-2.5 text-sm leading-6" /></label>
            <section><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-black">選項與答案</h3><label className="text-xs font-black text-[#52677c]">正確答案 <select value={form.answer} onChange={(event) => setForm({ ...form, answer: event.target.value })} className="ml-2 rounded-lg border border-[#cad7e4] px-2 py-1.5">{answerOptions.map((item) => <option key={item}>{item}</option>)}</select></label></div><div className="grid gap-3 sm:grid-cols-2">{form.options.map((option, index) => <label key={option.label} className="flex items-center gap-2 rounded-xl border border-[#dbe5ed] p-3"><strong className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e8f2fc] text-xs text-[#0b6bcb]">{option.label}</strong><input value={option.text} onChange={(event) => { const options = form.options.map((item, itemIndex) => itemIndex === index ? { ...item, text: event.target.value } : item); setForm({ ...form, options }); }} className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label>)}</div></section>

            <section className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-black text-[#52677c]">全國通過率（%）<input type="number" min="0" max="100" step="0.1" value={form.passRate === null ? '' : Number((form.passRate * 100).toFixed(2))} onChange={(event) => setForm({ ...form, passRate: event.target.value === '' ? null : Number(event.target.value) / 100 })} placeholder="尚無資料可留空" className="mt-2 w-full rounded-xl border border-[#cad7e4] px-3 py-2.5 text-sm" /></label>
              <label className="flex items-center gap-2 self-end rounded-xl bg-[#fff7e8] px-4 py-3 text-sm font-black text-[#795d16]"><input type="checkbox" checked={form.hasVisualMaterial} onChange={(event) => setForm({ ...form, hasVisualMaterial: event.target.checked })} />題目含圖表或題組材料</label>
            </section>

            <label className="block text-xs font-black text-[#52677c]">題意摘要<textarea rows={3} value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} className="mt-2 w-full rounded-xl border border-[#cad7e4] px-3 py-2.5 text-sm leading-6" /></label>
            <div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-black text-[#52677c]">解題關鍵<textarea rows={4} value={form.insight} onChange={(event) => setForm({ ...form, insight: event.target.value })} className="mt-2 w-full rounded-xl border border-[#cad7e4] px-3 py-2.5 text-sm leading-6" /></label><label className="text-xs font-black text-[#52677c]">常見誤區<textarea rows={4} value={form.trap} onChange={(event) => setForm({ ...form, trap: event.target.value })} className="mt-2 w-full rounded-xl border border-[#cad7e4] px-3 py-2.5 text-sm leading-6" /></label></div>
            <label className="block text-xs font-black text-[#52677c]">統計資料來源<input value={form.rateSource ?? ''} onChange={(event) => setForm({ ...form, rateSource: event.target.value || null })} placeholder="https://…" className="mt-2 w-full rounded-xl border border-[#cad7e4] px-3 py-2.5 text-sm" /></label>
          </div>
          <footer className="sticky bottom-0 flex gap-3 border-t border-[#e0e8ef] bg-white/95 px-5 py-4 backdrop-blur sm:px-7"><button type="submit" disabled={busy} className="rounded-xl bg-[#0b6bcb] px-6 py-3 text-sm font-black text-white disabled:opacity-50">{busy ? '儲存中…' : '儲存題目'}</button><button type="button" onClick={() => setForm(null)} className="rounded-xl bg-[#edf2f7] px-5 py-3 text-sm font-black text-[#52677c]">取消</button></footer>
        </form>
      </div>}
    </main>
  );
}
