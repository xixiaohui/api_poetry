export const promptBuilder = {
  analyse(title: string, content: string, author?: string, dynasty?: string): string {
    const header = author && dynasty
      ? `请赏析以下诗词：\n《${title}》- ${author}（${dynasty}）`
      : `请赏析以下诗词：\n《${title}》`;
    return `${header}\n\n${content}\n\n请从以下方面分析并返回JSON格式：\n1. background: 创作背景简介\n2. appreciation: 诗词赏析（200字左右）\n3. keywords: 3-5个关键词\n4. emotions: 2-3个主要情感`;
  },

  ask(question: string, context?: string): string {
    const base = "你是一位中国古诗词专家，请用中文回答用户问题。";
    if (context) {
      return `${base}\n\n参考诗词：\n${context}\n\n用户问题：${question}`;
    }
    return `${base}\n\n用户问题：${question}`;
  },

  translate(content: string, targetLang: string): string {
    const langNames: Record<string, string> = { en: "英文", ja: "日文", ko: "韩文" };
    const langName = langNames[targetLang] ?? "英文";
    return `请将以下古诗词翻译成${langName}，并解释关键典故。\n\n${content}\n\n请返回：\n1. translation: 翻译内容\n2. notes: 典故解释列表`;
  },
};
