'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { chapters, officialSource, questions, type Question } from './questions';

const years = [115, 114, 113, 112];
const statisticalDifficulties = ['全部難度', '低', '中', '高', '待統計'];
const reportFile = './全國會考生物試題圖表數據分析_APA7.docx';
const percent = (value: number | null) => value === null ? '待統計' : `${(value * 100).toFixed(1)}%`;

export default function Home() {
  const [chapter, setChapter] = useState('全部章節');
  const [year, setYear] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState('全部難度');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Question | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const filtered = useMemo(() => questions.filter((question) => {
    const chapterMatch = chapter === '全部章節' || question.chapter === chapter;
    const yearMatch = year === null || question.year === year;
    const difficultyMatch = difficulty === '全部難度' || question.statisticalDifficulty === difficulty;
    const text = `${question.year} ${question.number} ${question.chapter} ${question.topic} ${question.skill} ${question.summary} ${question.prompt} ${question.options.map((option) => option.text).join(' ')}`;
    return chapterMatch && yearMatch && difficultyMatch && text.toLowerCase().includes(query.trim().toLowerCase());
  }), [chapter, difficulty, query, year]);

  const yearStats = useMemo(() => [112, 113, 114].map((item) => {
    const rated = questions.filter((question) => question.year === item && question.errorRate !== null);
    return { year: item, average: rated.reduce((sum, question) => sum + (question.errorRate ?? 0), 0) / rated.length };
  }), []);

  const highErrorQuestions = useMemo(() => [...questions]
    .filter((question) => question.errorRate !== null)
    .sort((a, b) => (b.errorRate ?? 0) - (a.errorRate ?? 0))
    .slice(0, 5), []);

  useEffect(() => {
    if (!selected) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      window.requestAnimationFrame(() => lastFocusedRef.current?.focus());
    };
  }, [selected]);

  const openQuestion = (question: Question) => {
    lastFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSelected(question);
    setShowAnswer(false);
  };
  const closeQuestion = () => { setSelected(null); setShowAnswer(false); };
  const resetFilters = () => { setChapter('全部章節'); setYear(null); setDifficulty('全部難度'); setQuery(''); };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e4f3ff_0,transparent_32rem),linear-gradient(180deg,#f7fafe_0%,#eef4f9_100%)] text-[#132238]">
      <header className="sticky top-0 z-30 border-b border-[#d9e2ec]/90 bg-white/90 shadow-[0_8px_30px_rgba(20,48,76,.05)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1480px] items-center gap-4 px-5 py-4 lg:px-9">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0b6bcb] text-xs font-black tracking-wider text-white">BIO</div>
          <div className="min-w-0"><p className="truncate text-[10px] font-bold tracking-[0.18em] text-[#0b6bcb]">CAP BIOLOGY ATLAS</p><h1 className="truncate text-base font-black tracking-tight sm:text-lg">全國會考生物試題分析</h1></div>
          <label className="ml-auto hidden w-full max-w-md md:block"><span className="sr-only">搜尋題目</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋題幹、選項、章節或知識點…" className="w-full rounded-xl border border-[#cad7e4] bg-[#f8fafc] px-4 py-2.5 text-sm outline-none transition focus:border-[#0b6bcb] focus:ring-4 focus:ring-blue-100" /></label>
          <a href={officialSource} target="_blank" rel="noreferrer" className="hidden rounded-xl border border-[#cad7e4] px-3 py-2 text-xs font-bold text-[#42566c] transition hover:border-[#0b6bcb] hover:text-[#0b6bcb] sm:block">官方題本 ↗</a>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1480px] grid-cols-[minmax(0,1fr)] gap-6 px-5 py-7 lg:grid-cols-[238px_minmax(0,1fr)] lg:px-9">
        <aside className="min-w-0 space-y-5 rounded-3xl border border-white/80 bg-white/90 p-4 shadow-[0_18px_45px_rgba(26,64,101,.08)] backdrop-blur lg:sticky lg:top-24 lg:h-[calc(100vh-120px)] lg:overflow-auto">
          <div><p className="mb-3 px-2 text-[11px] font-black tracking-[0.14em] text-[#66788a]">依章節瀏覽</p><nav className="flex gap-2 overflow-x-auto pb-2 lg:grid lg:grid-cols-1 lg:overflow-visible lg:pb-0" aria-label="生物章節">
            {chapters.map((item) => { const count = item === '全部章節' ? questions.length : questions.filter((question) => question.chapter === item).length; return <button type="button" key={item} onClick={() => setChapter(item)} className={`flex min-w-[116px] shrink-0 items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-bold transition lg:min-w-0 ${chapter === item ? 'bg-[#0b6bcb] text-white shadow-sm' : 'bg-[#f5f8fb] text-[#42566c] hover:bg-[#edf4fb] lg:bg-transparent'}`}><span>{item}</span><span className={`ml-3 text-[10px] ${chapter === item ? 'text-blue-100' : 'text-[#8a9bad]'}`}>{count}</span></button>; })}
          </nav></div>
          <div className="border-t border-[#edf1f5] pt-5"><p className="mb-3 px-2 text-[11px] font-black tracking-[0.14em] text-[#66788a]">統計難度</p><select aria-label="選擇統計難度" value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="w-full rounded-xl border border-[#cad7e4] bg-white px-3 py-2.5 text-sm font-bold text-[#42566c] outline-none focus:border-[#0b6bcb]">{statisticalDifficulties.map((item) => <option key={item}>{item}</option>)}</select></div>
          <a href={reportFile} download className="block rounded-xl bg-[#0b6bcb] px-4 py-3 text-center text-sm font-black text-white shadow-sm transition hover:bg-[#095aa9]">下載 APA 7 Word 報告 ↓</a>
          <div className="rounded-xl bg-[#eff7f4] p-3 text-xs leading-5 text-[#42665b]"><strong className="block text-[#08765a]">統計口徑</strong>答錯率＝1－全國通過率。低：少於25%；中：25%–45%；高：超過45%。115年逐題數據尚待公開。</div>
        </aside>

        <section className="min-w-0">
          <div className="relative mb-6 overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#0d2b49_0%,#104d78_58%,#0a7768_100%)] px-6 py-8 text-white shadow-[0_22px_60px_rgba(20,61,94,.2)] sm:px-9 sm:py-10">
            <div aria-hidden="true" className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[42px] border-white/5" />
            <div aria-hidden="true" className="absolute -bottom-24 right-48 h-44 w-44 rounded-full bg-[#65d0b0]/10 blur-2xl" />
            <div className="relative grid gap-7 md:grid-cols-[1fr_auto] md:items-end"><div><p className="mb-3 inline-flex rounded-full border border-[#8de3c8]/25 bg-[#65d0b0]/10 px-3 py-1.5 text-[11px] font-black tracking-[0.14em] text-[#9be7d0]">從題目全文到全國答錯率，一頁完成複習判讀</p><h2 className="max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-[2.65rem]">讀完整題幹與選項，<br className="hidden sm:block" />再用數據決定複習優先順序。</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-[#d4e4f0]">整理112–115年會考自然科生物題，呈現題目內容、選項、章節、解題關鍵、常見誤區與公開的全國答錯率。</p><div className="mt-6 flex flex-wrap gap-3"><a href={reportFile} download className="rounded-xl bg-[#78d8bc] px-4 py-3 text-sm font-black text-[#0b2e28] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#93e5cc]">下載完整圖表數據（Word）</a><a href="#question-index" className="rounded-xl border border-white/30 bg-white/5 px-4 py-3 text-sm font-black text-white transition hover:bg-white/15">開始選題 ↓</a></div></div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3"><div className="rounded-2xl bg-white/10 p-3 sm:p-4"><strong className="block text-2xl">4</strong><span className="text-[10px] text-[#c9d8e7] sm:text-xs">收錄年度</span></div><div className="rounded-2xl bg-white/10 p-3 sm:p-4"><strong className="block text-2xl">{questions.length}</strong><span className="text-[10px] text-[#c9d8e7] sm:text-xs">完整題目</span></div><div className="rounded-2xl bg-white/10 p-3 sm:p-4"><strong className="block text-2xl">{questions.filter((question) => question.errorRate !== null).length}</strong><span className="text-[10px] text-[#c9d8e7] sm:text-xs">題含統計</span></div></div></div>
          </div>

          <div className="mb-6 grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
            <section className="rounded-3xl border border-white/80 bg-white/95 p-5 shadow-[0_14px_38px_rgba(26,64,101,.07)]" aria-labelledby="year-error-title"><div className="mb-5 flex items-end justify-between"><div><p className="text-[10px] font-black tracking-[0.14em] text-[#0b6bcb]">DATA SNAPSHOT</p><h3 id="year-error-title" className="text-lg font-black">各年度收錄題平均答錯率</h3></div><span className="rounded-full bg-[#edf5fc] px-2.5 py-1 text-[10px] font-bold text-[#597088]">全國統計</span></div><div className="space-y-4">{yearStats.map((stat) => <div key={stat.year} className="grid grid-cols-[52px_1fr_54px] items-center gap-3"><strong className="text-sm">{stat.year}年</strong><div className="h-3 overflow-hidden rounded-full bg-[#e8eef4]"><div className="h-full rounded-full bg-[linear-gradient(90deg,#0b6bcb,#36a6d9)]" style={{ width: `${stat.average * 100}%` }} /></div><span className="text-right text-xs font-black text-[#42566c]">{percent(stat.average)}</span></div>)}</div><p className="mt-5 border-t border-[#edf1f5] pt-4 text-xs leading-5 text-[#66788a]">研究結果：三個年度收錄題的平均答錯率皆保留原始題目差異；此圖僅比較本站選取的生物題，不代表整份自然科試卷難度。</p></section>
            <section className="rounded-3xl border border-white/80 bg-white/95 p-5 shadow-[0_14px_38px_rgba(26,64,101,.07)]" aria-labelledby="high-error-title"><div className="mb-4"><p className="text-[10px] font-black tracking-[0.14em] text-[#b25f00]">PRIORITY REVIEW</p><h3 id="high-error-title" className="text-lg font-black">答錯率最高的5題</h3></div><ol className="space-y-2">{highErrorQuestions.map((question, index) => <li key={question.id}><button type="button" aria-haspopup="dialog" aria-label={`開啟${question.year}年第${question.number}題解析`} onClick={() => openQuestion(question)} className="group/priority flex w-full items-center gap-3 rounded-xl border border-transparent bg-[#fff8ed] px-3 py-2.5 text-left transition hover:border-[#f1c77b] hover:bg-[#ffefd4]"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#b25f00] text-[10px] font-black text-white">{index + 1}</span><span className="min-w-0 flex-1 truncate text-xs font-bold">{question.year}年第{question.number}題 · {question.topic}</span><strong className="text-xs text-[#9a5200]">{percent(question.errorRate)}</strong><span aria-hidden="true" className="text-[#b25f00] transition group-hover/priority:translate-x-0.5">›</span></button></li>)}</ol><p className="mt-4 text-xs leading-5 text-[#66788a]">研究結果：高答錯率題集中呈現多步推論、資料判讀與概念轉換需求，適合優先安排精讀與錯因討論。</p></section>
          </div>

          <label className="mb-4 block md:hidden"><span className="sr-only">搜尋題目</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋題幹、選項、章節或知識點…" className="w-full rounded-xl border border-[#cad7e4] bg-white px-4 py-3 text-sm outline-none focus:border-[#0b6bcb]" /></label>
          <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-[#d9e2ec] bg-white p-4 sm:flex-row sm:items-center"><div className="flex flex-wrap gap-2"><button onClick={() => setYear(null)} className={`rounded-full px-3.5 py-2 text-xs font-black transition ${year === null ? 'bg-[#102f4f] text-white' : 'bg-[#edf2f7] text-[#52677c] hover:bg-[#dae7f3]'}`}>全部年度</button>{years.map((item) => <button key={item} onClick={() => setYear(item)} className={`rounded-full px-3.5 py-2 text-xs font-black transition ${year === item ? 'bg-[#102f4f] text-white' : 'bg-[#edf2f7] text-[#52677c] hover:bg-[#dae7f3]'}`}>{item}年</button>)}</div><div className="sm:ml-auto"><span className="text-sm font-bold text-[#66788a]">找到 {filtered.length} 題</span><button onClick={resetFilters} className="ml-3 text-xs font-bold text-[#0b6bcb] hover:underline">清除篩選</button></div></div>
          <div id="question-index" className="mb-4 scroll-mt-24"><p className="text-xs font-bold text-[#0b6bcb]">QUESTION INDEX</p><h3 className="text-xl font-black">{chapter}{year ? ` · ${year}年` : ''}</h3></div>

          {filtered.length ? <div className="grid gap-5 xl:grid-cols-2">{filtered.map((question) => <article key={question.id} className="group relative overflow-hidden rounded-3xl border border-white/90 bg-white/95 p-5 shadow-[0_12px_34px_rgba(26,64,101,.07)] transition hover:-translate-y-0.5 hover:border-[#9dc7e9] hover:shadow-[0_18px_42px_rgba(24,61,98,.12)]">
            <div aria-hidden="true" className={`absolute inset-x-0 top-0 h-1.5 ${question.statisticalDifficulty === '高' ? 'bg-[#d66d47]' : question.statisticalDifficulty === '中' ? 'bg-[#e3a22b]' : question.statisticalDifficulty === '低' ? 'bg-[#21a77f]' : 'bg-[#a9b8c7]'}`} />
            <div className="mb-4 flex flex-wrap items-center gap-2"><span className="rounded-lg bg-[#102f4f] px-2.5 py-1 text-xs font-black text-white">{question.year} 年 · 第 {question.number} 題</span><span className="rounded-lg bg-[#e8f2fc] px-2.5 py-1 text-xs font-bold text-[#0b6bcb]">{question.chapter}</span>{question.hasVisualMaterial && <span className="rounded-lg bg-[#fff3dd] px-2.5 py-1 text-xs font-bold text-[#9a5200]">含圖表／題組材料</span>}</div>
            <h4 className="text-lg font-black">{question.topic}</h4><p className="mt-3 text-sm font-medium leading-6 text-[#334a61]">{question.prompt}</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{question.options.map((option) => <div key={option.label} className="rounded-xl border border-[#e0e7ee] bg-[#f8fafc] px-3 py-2.5 text-xs leading-5 text-[#42566c]"><strong className="mr-2 text-[#0b6bcb]">{option.label}</strong>{option.text}</div>)}</div>
            {question.hasVisualMaterial && <p className="mt-3 text-[11px] leading-5 text-[#8a6500]">題幹涉及圖表或題組材料；本站呈現文字，完整視覺材料請對照官方題本。</p>}
            <div className="mt-4 rounded-xl bg-[#f2f7fb] p-3"><div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs"><span><b>統計難度：</b>{question.statisticalDifficulty}</span><span><b>全國通過率：</b>{percent(question.passRate)}</span><span><b>答錯率：</b>{percent(question.errorRate)}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#dfe8f1]"><div className={`h-full rounded-full ${question.errorRate !== null && question.errorRate > 0.45 ? 'bg-[#c9633e]' : question.errorRate !== null && question.errorRate >= 0.25 ? 'bg-[#d99a24]' : 'bg-[#19a47b]'}`} style={{ width: `${(question.errorRate ?? 0) * 100}%` }} /></div><p className="mt-2 text-[11px] leading-5 text-[#5e7185]">{question.rateAnalysis}</p></div>
            <div className="mt-4 flex flex-col gap-3 border-t border-[#edf1f5] pt-4 text-xs font-bold sm:flex-row sm:items-center sm:justify-between"><span className="text-[#66788a]">能力：{question.skill} · 教學難度：{question.difficulty}</span><button type="button" aria-haspopup="dialog" aria-label={`查看${question.year}年第${question.number}題解析`} onClick={() => openQuestion(question)} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0b6bcb] px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#095aa9] focus-visible:ring-4 focus-visible:ring-blue-100">查看完整解析 <span aria-hidden="true" className="ml-1">→</span></button></div>
          </article>)}</div> : <div className="rounded-2xl border border-dashed border-[#b9c9d9] bg-white p-10 text-center"><strong className="block text-lg">沒有符合條件的題目</strong><button onClick={resetFilters} className="mt-3 text-sm font-bold text-[#0b6bcb]">清除篩選</button></div>}
          <footer className="mt-10 border-t border-[#d9e2ec] py-6 text-xs leading-6 text-[#66788a]">本網站為非官方教學整理。題幹、選項、年度、題號與答案依公開會考資料核對；解析、章節與教學難度為本站判定。統計難度由全國通過率換算，115年尚未取得公開逐題統計。</footer>
        </section>
      </div>

      {selected && <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#071a2e]/70 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(event) => { if (event.currentTarget === event.target) closeQuestion(); }}>
        <div role="dialog" aria-modal="true" aria-labelledby="question-title" aria-describedby="question-prompt" className="flex max-h-[96vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-[0_30px_100px_rgba(2,20,38,.35)] sm:max-h-[92vh] sm:rounded-[2rem]">
          <header className="flex items-start gap-4 border-b border-[#e5ebf1] bg-white px-5 py-4 sm:px-8 sm:py-5">
            <div className="min-w-0"><p className="text-[11px] font-black tracking-[0.12em] text-[#0b6bcb]">{selected.year} 年自然科 · 第 {selected.number} 題 · {selected.chapter}</p><h3 id="question-title" className="mt-1 truncate text-xl font-black sm:text-2xl">{selected.topic}</h3></div>
            <button ref={closeButtonRef} type="button" onClick={closeQuestion} aria-label="關閉解析" className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf2f7] text-xl font-bold text-[#52677c] transition hover:bg-[#dfe9f2] hover:text-[#102f4f]">×</button>
          </header>

          <div className="modal-scroll overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="rounded-2xl bg-[#edf5fc] p-3.5"><span className="text-[10px] font-bold text-[#6c8297]">章節</span><strong className="mt-1 block text-sm">{selected.chapter}</strong></div><div className="rounded-2xl bg-[#eff7f4] p-3.5"><span className="text-[10px] font-bold text-[#6c8297]">評量能力</span><strong className="mt-1 block text-sm">{selected.skill}</strong></div><div className="rounded-2xl bg-[#fff7e8] p-3.5"><span className="text-[10px] font-bold text-[#6c8297]">統計難度</span><strong className="mt-1 block text-sm">{selected.statisticalDifficulty}</strong></div><div className="rounded-2xl bg-[#fff0eb] p-3.5"><span className="text-[10px] font-bold text-[#6c8297]">答錯率</span><strong className="mt-1 block text-sm">{percent(selected.errorRate)}</strong></div></div>

            <section className="mt-6 rounded-3xl border border-[#dce6ef] bg-[#f9fbfd] p-5 sm:p-6"><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#102f4f] text-xs font-black text-white">Q</span><h4 className="text-xs font-black tracking-[0.12em] text-[#52677c]">題目全文</h4></div><p id="question-prompt" className="mt-4 text-base font-medium leading-8 text-[#273e54]">{selected.prompt}</p><div className="mt-5 grid gap-2.5 sm:grid-cols-2">{selected.options.map((option) => <div key={option.label} className={`relative rounded-2xl border px-4 py-3.5 text-sm leading-6 transition ${showAnswer && option.label === selected.answer ? 'border-[#19a47b] bg-[#e7f8f1] text-[#155d49] shadow-[0_0_0_3px_rgba(25,164,123,.08)]' : 'border-[#dfe6ed] bg-white text-[#42566c]'}`}><strong className={`mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${showAnswer && option.label === selected.answer ? 'bg-[#19a47b] text-white' : 'bg-[#e8f2fc] text-[#0b6bcb]'}`}>{option.label}</strong>{option.text}{showAnswer && option.label === selected.answer && <span className="ml-2 text-xs font-black text-[#08765a]">✓ 正確答案</span>}</div>)}</div>{selected.hasVisualMaterial && <p className="mt-4 rounded-xl bg-[#fff7e8] px-3.5 py-3 text-xs leading-5 text-[#795d16]">本題含圖表或共用題組材料，請搭配官方題本取得完整視覺資訊。</p>}</section>

            <section className="mt-5 rounded-2xl border border-[#d7e4ef] bg-[#f2f7fb] p-5"><div className="flex flex-wrap gap-x-5 gap-y-2 text-sm"><span><b>全國通過率：</b>{percent(selected.passRate)}</span><span><b>答錯率：</b>{percent(selected.errorRate)}</span><span><b>統計難度：</b>{selected.statisticalDifficulty}</span></div><div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#dfe8f1]"><div className={`h-full rounded-full ${selected.errorRate !== null && selected.errorRate > 0.45 ? 'bg-[#c9633e]' : selected.errorRate !== null && selected.errorRate >= 0.25 ? 'bg-[#d99a24]' : 'bg-[#19a47b]'}`} style={{ width: `${(selected.errorRate ?? 0) * 100}%` }} /></div><p className="mt-3 text-sm leading-6 text-[#52677c]">{selected.rateAnalysis}</p>{selected.rateSource && <a href={selected.rateSource} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center text-xs font-black text-[#0b6bcb] hover:underline">查看統計資料來源 ↗</a>}</section>

            <section className="mt-5 rounded-2xl border border-[#e0e7ee] p-5"><h4 className="text-xs font-black tracking-[0.12em] text-[#66788a]">題意摘要</h4><p className="mt-2 text-base leading-7 text-[#334a61]">{selected.summary}</p></section>
            <div className="mt-4 grid gap-4 md:grid-cols-2"><section className="rounded-2xl bg-[#eaf8f3] p-5"><div className="flex items-center gap-2"><span aria-hidden="true" className="text-lg">◎</span><h4 className="text-xs font-black tracking-[0.12em] text-[#08765a]">解題關鍵</h4></div><p className="mt-2 leading-7 text-[#2f5349]">{selected.insight}</p></section><section className="rounded-2xl border border-[#ead8aa] bg-[#fffaf0] p-5"><div className="flex items-center gap-2"><span aria-hidden="true" className="text-lg">!</span><h4 className="text-xs font-black tracking-[0.12em] text-[#8a6500]">常見誤區</h4></div><p className="mt-2 leading-7 text-[#695325]">{selected.trap}</p></section></div>
          </div>

          <footer className="flex flex-col gap-3 border-t border-[#e5ebf1] bg-white px-5 py-4 sm:flex-row sm:items-center sm:px-8"><button type="button" onClick={() => setShowAnswer(true)} aria-live="polite" className="min-h-12 rounded-xl bg-[#0b6bcb] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#095aa9]">{showAnswer ? `正確答案：${selected.answer}` : '顯示正確答案'}</button><a href={officialSource} target="_blank" rel="noreferrer" className="min-h-12 rounded-xl border border-[#cad7e4] px-5 py-3 text-center text-sm font-black text-[#42566c] transition hover:border-[#0b6bcb] hover:text-[#0b6bcb]">前往官方歷屆試題 ↗</a><button type="button" onClick={closeQuestion} className="min-h-12 rounded-xl px-4 py-3 text-sm font-black text-[#66788a] hover:bg-[#edf2f7] sm:ml-auto">關閉解析</button></footer>
        </div>
      </div>}
    </main>
  );
}
