'use client';

import { useMemo, useState } from 'react';
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

  const openQuestion = (question: Question) => { setSelected(question); setShowAnswer(false); };
  const resetFilters = () => { setChapter('全部章節'); setYear(null); setDifficulty('全部難度'); setQuery(''); };

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-[#132238]">
      <header className="sticky top-0 z-30 border-b border-[#d9e2ec] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1480px] items-center gap-4 px-5 py-4 lg:px-9">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0b6bcb] text-xs font-black tracking-wider text-white">BIO</div>
          <div className="min-w-0"><p className="truncate text-[10px] font-bold tracking-[0.18em] text-[#0b6bcb]">CAP BIOLOGY ATLAS</p><h1 className="truncate text-base font-black tracking-tight sm:text-lg">全國會考生物試題分析</h1></div>
          <label className="ml-auto hidden w-full max-w-md md:block"><span className="sr-only">搜尋題目</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋題幹、選項、章節或知識點…" className="w-full rounded-xl border border-[#cad7e4] bg-[#f8fafc] px-4 py-2.5 text-sm outline-none transition focus:border-[#0b6bcb] focus:ring-4 focus:ring-blue-100" /></label>
          <a href={officialSource} target="_blank" rel="noreferrer" className="hidden rounded-xl border border-[#cad7e4] px-3 py-2 text-xs font-bold text-[#42566c] transition hover:border-[#0b6bcb] hover:text-[#0b6bcb] sm:block">官方題本 ↗</a>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1480px] gap-6 px-5 py-7 lg:grid-cols-[238px_minmax(0,1fr)] lg:px-9">
        <aside className="space-y-5 rounded-2xl border border-[#d9e2ec] bg-white p-4 lg:sticky lg:top-24 lg:h-[calc(100vh-120px)] lg:overflow-auto">
          <div><p className="mb-3 px-2 text-[11px] font-black tracking-[0.14em] text-[#66788a]">依章節瀏覽</p><nav className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1" aria-label="生物章節">
            {chapters.map((item) => { const count = item === '全部章節' ? questions.length : questions.filter((question) => question.chapter === item).length; return <button key={item} onClick={() => setChapter(item)} className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${chapter === item ? 'bg-[#0b6bcb] text-white shadow-sm' : 'text-[#42566c] hover:bg-[#edf4fb]'}`}><span>{item}</span><span className={`text-[10px] ${chapter === item ? 'text-blue-100' : 'text-[#8a9bad]'}`}>{count}</span></button>; })}
          </nav></div>
          <div className="border-t border-[#edf1f5] pt-5"><p className="mb-3 px-2 text-[11px] font-black tracking-[0.14em] text-[#66788a]">統計難度</p><select aria-label="選擇統計難度" value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="w-full rounded-xl border border-[#cad7e4] bg-white px-3 py-2.5 text-sm font-bold text-[#42566c] outline-none focus:border-[#0b6bcb]">{statisticalDifficulties.map((item) => <option key={item}>{item}</option>)}</select></div>
          <a href={reportFile} download className="block rounded-xl bg-[#0b6bcb] px-4 py-3 text-center text-sm font-black text-white shadow-sm transition hover:bg-[#095aa9]">下載 APA 7 Word 報告 ↓</a>
          <div className="rounded-xl bg-[#eff7f4] p-3 text-xs leading-5 text-[#42665b]"><strong className="block text-[#08765a]">統計口徑</strong>答錯率＝1－全國通過率。低：少於25%；中：25%–45%；高：超過45%。115年逐題數據尚待公開。</div>
        </aside>

        <section>
          <div className="mb-6 overflow-hidden rounded-3xl bg-[#102f4f] px-6 py-7 text-white shadow-[0_18px_50px_rgba(23,57,92,.14)] sm:px-8">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end"><div><p className="mb-2 text-xs font-bold tracking-[0.16em] text-[#78d8bf]">從題目全文到全國答錯率，一頁完成複習判讀</p><h2 className="max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">讀完整題幹與選項，<br className="hidden sm:block" />再用數據決定複習優先順序。</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-[#c9d8e7]">整理112–115年會考自然科生物題，呈現題目內容、選項、章節、解題關鍵、常見誤區與公開的全國答錯率。</p><div className="mt-5 flex flex-wrap gap-3"><a href={reportFile} download className="rounded-xl bg-[#65d0b0] px-4 py-3 text-sm font-black text-[#0b2e28] transition hover:bg-[#80dfc3]">下載完整圖表數據（Word）</a><a href="#question-index" className="rounded-xl border border-white/25 px-4 py-3 text-sm font-black text-white hover:bg-white/10">開始選題</a></div></div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3"><div className="rounded-2xl bg-white/10 p-3 sm:p-4"><strong className="block text-2xl">4</strong><span className="text-[10px] text-[#c9d8e7] sm:text-xs">收錄年度</span></div><div className="rounded-2xl bg-white/10 p-3 sm:p-4"><strong className="block text-2xl">{questions.length}</strong><span className="text-[10px] text-[#c9d8e7] sm:text-xs">完整題目</span></div><div className="rounded-2xl bg-white/10 p-3 sm:p-4"><strong className="block text-2xl">{questions.filter((question) => question.errorRate !== null).length}</strong><span className="text-[10px] text-[#c9d8e7] sm:text-xs">題含統計</span></div></div></div>
          </div>

          <div className="mb-6 grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
            <section className="rounded-2xl border border-[#d9e2ec] bg-white p-5" aria-labelledby="year-error-title"><div className="mb-5 flex items-end justify-between"><div><p className="text-[10px] font-black tracking-[0.14em] text-[#0b6bcb]">DATA SNAPSHOT</p><h3 id="year-error-title" className="text-lg font-black">各年度收錄題平均答錯率</h3></div><span className="text-[10px] text-[#7b8ea1]">全國統計</span></div><div className="space-y-4">{yearStats.map((stat) => <div key={stat.year} className="grid grid-cols-[52px_1fr_54px] items-center gap-3"><strong className="text-sm">{stat.year}年</strong><div className="h-3 overflow-hidden rounded-full bg-[#e8eef4]"><div className="h-full rounded-full bg-[#0b6bcb]" style={{ width: `${stat.average * 100}%` }} /></div><span className="text-right text-xs font-black text-[#42566c]">{percent(stat.average)}</span></div>)}</div><p className="mt-5 border-t border-[#edf1f5] pt-4 text-xs leading-5 text-[#66788a]">研究結果：三個年度收錄題的平均答錯率皆保留原始題目差異；此圖僅比較本站選取的生物題，不代表整份自然科試卷難度。</p></section>
            <section className="rounded-2xl border border-[#d9e2ec] bg-white p-5" aria-labelledby="high-error-title"><div className="mb-4"><p className="text-[10px] font-black tracking-[0.14em] text-[#b25f00]">PRIORITY REVIEW</p><h3 id="high-error-title" className="text-lg font-black">答錯率最高的5題</h3></div><ol className="space-y-2">{highErrorQuestions.map((question, index) => <li key={question.id}><button onClick={() => openQuestion(question)} className="flex w-full items-center gap-3 rounded-xl bg-[#fff8ed] px-3 py-2.5 text-left hover:bg-[#ffefd4]"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#b25f00] text-[10px] font-black text-white">{index + 1}</span><span className="min-w-0 flex-1 truncate text-xs font-bold">{question.year}年第{question.number}題 · {question.topic}</span><strong className="text-xs text-[#9a5200]">{percent(question.errorRate)}</strong></button></li>)}</ol><p className="mt-4 text-xs leading-5 text-[#66788a]">研究結果：高答錯率題集中呈現多步推論、資料判讀與概念轉換需求，適合優先安排精讀與錯因討論。</p></section>
          </div>

          <label className="mb-4 block md:hidden"><span className="sr-only">搜尋題目</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋題幹、選項、章節或知識點…" className="w-full rounded-xl border border-[#cad7e4] bg-white px-4 py-3 text-sm outline-none focus:border-[#0b6bcb]" /></label>
          <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-[#d9e2ec] bg-white p-4 sm:flex-row sm:items-center"><div className="flex flex-wrap gap-2"><button onClick={() => setYear(null)} className={`rounded-full px-3.5 py-2 text-xs font-black transition ${year === null ? 'bg-[#102f4f] text-white' : 'bg-[#edf2f7] text-[#52677c] hover:bg-[#dae7f3]'}`}>全部年度</button>{years.map((item) => <button key={item} onClick={() => setYear(item)} className={`rounded-full px-3.5 py-2 text-xs font-black transition ${year === item ? 'bg-[#102f4f] text-white' : 'bg-[#edf2f7] text-[#52677c] hover:bg-[#dae7f3]'}`}>{item}年</button>)}</div><div className="sm:ml-auto"><span className="text-sm font-bold text-[#66788a]">找到 {filtered.length} 題</span><button onClick={resetFilters} className="ml-3 text-xs font-bold text-[#0b6bcb] hover:underline">清除篩選</button></div></div>
          <div id="question-index" className="mb-4 scroll-mt-24"><p className="text-xs font-bold text-[#0b6bcb]">QUESTION INDEX</p><h3 className="text-xl font-black">{chapter}{year ? ` · ${year}年` : ''}</h3></div>

          {filtered.length ? <div className="grid gap-5 xl:grid-cols-2">{filtered.map((question) => <article key={question.id} className="group rounded-2xl border border-[#d9e2ec] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#8eb9e5] hover:shadow-[0_14px_30px_rgba(24,61,98,.09)]">
            <div className="mb-4 flex flex-wrap items-center gap-2"><span className="rounded-lg bg-[#102f4f] px-2.5 py-1 text-xs font-black text-white">{question.year} 年 · 第 {question.number} 題</span><span className="rounded-lg bg-[#e8f2fc] px-2.5 py-1 text-xs font-bold text-[#0b6bcb]">{question.chapter}</span>{question.hasVisualMaterial && <span className="rounded-lg bg-[#fff3dd] px-2.5 py-1 text-xs font-bold text-[#9a5200]">含圖表／題組材料</span>}</div>
            <h4 className="text-lg font-black">{question.topic}</h4><p className="mt-3 text-sm font-medium leading-6 text-[#334a61]">{question.prompt}</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{question.options.map((option) => <div key={option.label} className="rounded-xl border border-[#e0e7ee] bg-[#f8fafc] px-3 py-2.5 text-xs leading-5 text-[#42566c]"><strong className="mr-2 text-[#0b6bcb]">{option.label}</strong>{option.text}</div>)}</div>
            {question.hasVisualMaterial && <p className="mt-3 text-[11px] leading-5 text-[#8a6500]">題幹涉及圖表或題組材料；本站呈現文字，完整視覺材料請對照官方題本。</p>}
            <div className="mt-4 rounded-xl bg-[#f2f7fb] p-3"><div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs"><span><b>統計難度：</b>{question.statisticalDifficulty}</span><span><b>全國通過率：</b>{percent(question.passRate)}</span><span><b>答錯率：</b>{percent(question.errorRate)}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#dfe8f1]"><div className={`h-full rounded-full ${question.errorRate !== null && question.errorRate > 0.45 ? 'bg-[#c9633e]' : question.errorRate !== null && question.errorRate >= 0.25 ? 'bg-[#d99a24]' : 'bg-[#19a47b]'}`} style={{ width: `${(question.errorRate ?? 0) * 100}%` }} /></div><p className="mt-2 text-[11px] leading-5 text-[#5e7185]">{question.rateAnalysis}</p></div>
            <div className="mt-4 flex items-center justify-between border-t border-[#edf1f5] pt-4 text-xs font-bold"><span className="text-[#66788a]">能力：{question.skill} · 教學難度：{question.difficulty}</span><button onClick={() => openQuestion(question)} className="rounded-lg bg-[#e8f2fc] px-3 py-2 text-[#0b6bcb] transition group-hover:bg-[#0b6bcb] group-hover:text-white">查看解析 →</button></div>
          </article>)}</div> : <div className="rounded-2xl border border-dashed border-[#b9c9d9] bg-white p-10 text-center"><strong className="block text-lg">沒有符合條件的題目</strong><button onClick={resetFilters} className="mt-3 text-sm font-bold text-[#0b6bcb]">清除篩選</button></div>}
          <footer className="mt-10 border-t border-[#d9e2ec] py-6 text-xs leading-6 text-[#66788a]">本網站為非官方教學整理。題幹、選項、年度、題號與答案依公開會考資料核對；解析、章節與教學難度為本站判定。統計難度由全國通過率換算，115年尚未取得公開逐題統計。</footer>
        </section>
      </div>

      {selected && <div role="dialog" aria-modal="true" aria-labelledby="question-title" className="fixed inset-0 z-50 flex items-end justify-center bg-[#071a2e]/65 p-0 sm:items-center sm:p-6" onMouseDown={(event) => { if (event.currentTarget === event.target) setSelected(null); }}><div className="max-h-[94vh] w-full max-w-3xl overflow-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8">
        <div className="mb-5 flex items-start gap-3"><div><p className="text-xs font-black text-[#0b6bcb]">{selected.year} 年自然科 · 第 {selected.number} 題</p><h3 id="question-title" className="mt-1 text-2xl font-black">{selected.topic}</h3></div><button onClick={() => setSelected(null)} aria-label="關閉解析" className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#edf2f7] text-lg font-bold text-[#52677c]">×</button></div>
        <div className="grid gap-3 sm:grid-cols-4"><div className="rounded-xl bg-[#f2f7fb] p-3"><span className="text-[10px] font-bold text-[#7b8ea1]">章節</span><strong className="block text-sm">{selected.chapter}</strong></div><div className="rounded-xl bg-[#f2f7fb] p-3"><span className="text-[10px] font-bold text-[#7b8ea1]">評量能力</span><strong className="block text-sm">{selected.skill}</strong></div><div className="rounded-xl bg-[#f2f7fb] p-3"><span className="text-[10px] font-bold text-[#7b8ea1]">統計難度</span><strong className="block text-sm">{selected.statisticalDifficulty}</strong></div><div className="rounded-xl bg-[#f2f7fb] p-3"><span className="text-[10px] font-bold text-[#7b8ea1]">答錯率</span><strong className="block text-sm">{percent(selected.errorRate)}</strong></div></div>
        <section className="mt-6"><h4 className="text-xs font-black tracking-[0.12em] text-[#66788a]">題目全文</h4><p className="mt-2 text-base font-medium leading-8 text-[#273e54]">{selected.prompt}</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{selected.options.map((option) => <div key={option.label} className={`rounded-xl border px-4 py-3 text-sm leading-6 ${showAnswer && option.label === selected.answer ? 'border-[#19a47b] bg-[#eaf8f3] text-[#17624e]' : 'border-[#dfe6ed] bg-[#f8fafc] text-[#42566c]'}`}><strong className="mr-2">{option.label}</strong>{option.text}</div>)}</div>{selected.hasVisualMaterial && <p className="mt-3 text-xs text-[#8a6500]">本題含圖表或共用題組材料，請搭配官方題本取得完整視覺資訊。</p>}</section>
        <section className="mt-6 rounded-2xl border border-[#d7e4ef] bg-[#f2f7fb] p-5"><div className="flex flex-wrap gap-4 text-sm"><span><b>全國通過率：</b>{percent(selected.passRate)}</span><span><b>答錯率：</b>{percent(selected.errorRate)}</span><span><b>統計難度：</b>{selected.statisticalDifficulty}</span></div><p className="mt-2 text-sm leading-6 text-[#52677c]">{selected.rateAnalysis}</p>{selected.rateSource && <a href={selected.rateSource} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-bold text-[#0b6bcb] hover:underline">查看統計資料來源 ↗</a>}</section>
        <section className="mt-4"><h4 className="text-xs font-black tracking-[0.12em] text-[#66788a]">題意摘要</h4><p className="mt-2 text-base leading-7 text-[#334a61]">{selected.summary}</p></section><section className="mt-4 rounded-2xl bg-[#eff7f4] p-5"><h4 className="text-xs font-black tracking-[0.12em] text-[#08765a]">解題關鍵</h4><p className="mt-2 leading-7 text-[#2f5349]">{selected.insight}</p></section><section className="mt-4 rounded-2xl border border-[#ead8aa] bg-[#fffaf0] p-5"><h4 className="text-xs font-black tracking-[0.12em] text-[#8a6500]">常見誤區</h4><p className="mt-2 leading-7 text-[#695325]">{selected.trap}</p></section>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"><button onClick={() => setShowAnswer(true)} className="rounded-xl bg-[#0b6bcb] px-5 py-3 text-sm font-black text-white hover:bg-[#095aa9]">{showAnswer ? `正確答案：${selected.answer}` : '顯示答案'}</button><a href={officialSource} target="_blank" rel="noreferrer" className="rounded-xl border border-[#cad7e4] px-5 py-3 text-center text-sm font-black text-[#42566c] hover:border-[#0b6bcb] hover:text-[#0b6bcb]">前往官方歷屆試題 ↗</a></div>
      </div></div>}
    </main>
  );
}
