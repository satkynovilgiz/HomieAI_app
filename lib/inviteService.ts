export function generateInviteLink(userId: string): string {
  const code = userId.slice(0, 8).toUpperCase();
  return `https://homieai-steel.vercel.app/join?ref=${code}`;
}

export function generateInviteMessage(userName: string, link: string, language: string = 'en'): string {
  const messages: Record<string, string> = {
    en: `hey! i am using Homie — a free AI study buddy that actually helps you learn. join me and we can study together!\n\n${link}`,
    es: `hey! estoy usando Homie — un compañero de estudio con IA gratis que te ayuda a aprender. únete y podemos estudiar juntos!\n\n${link}`,
    ru: `привет! я использую Homie — бесплатный ИИ-помощник для учёбы. присоединяйся и будем учиться вместе!\n\n${link}`,
  };
  return messages[language] || messages.en;
}
