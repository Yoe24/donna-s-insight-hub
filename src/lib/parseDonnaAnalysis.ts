export interface DonnaAnalysis {
  resume: string;
  recommandation: string;
  attention: string;
}

export function parseDonnaAnalysis(text: string | null | undefined): DonnaAnalysis {
  const sections: DonnaAnalysis = { resume: '', recommandation: '', attention: '' };
  if (!text) return sections;

  const resumeMatch = text.match(/📋[^\n]*\n([\s\S]*?)(?=🎯|$)/);
  const recoMatch = text.match(/🎯[^\n]*\n([\s\S]*?)(?=💡|$)/);
  const attentionMatch = text.match(/💡[^\n]*\n([\s\S]*?)$/);

  if (resumeMatch) sections.resume = resumeMatch[1].trim();
  if (recoMatch) sections.recommandation = recoMatch[1].trim();
  if (attentionMatch) sections.attention = attentionMatch[1].trim();

  return sections;
}
