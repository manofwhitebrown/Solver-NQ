import type { Mode, Subject } from '@/types';

type Verified = 'match' | 'mismatch' | 'unchecked';
export interface DemoQ {
  n: number; subject: Subject; text: string; tags: string[]; starred?: boolean;
  mode: Mode; final: string; steps: Array<[title: string, body: string]>; verified: Verified;
  /** Optional older answer in the other mode, so both modes exist. */
  other?: { mode: Mode; final: string; steps: Array<[string, string]> };
}

const LONG_WORD = 'Supercalifragilisticexpialidocious_antidisestablishmentarianism_pneumonoultramicroscopicsilicovolcanoconiosis';
const LONG_LINE = 'result = [compute_value(index, offset, scale_factor) for index in range(0, 1000) if index % 7 == 0 and index % 11 != 0]  # a deliberately long line';

export const DEMO_QUESTIONS: DemoQ[] = [
  { n: 1, subject: 'math', tags: ['algebra'], starred: true, mode: 'learn', verified: 'match',
    text: 'Solve the quadratic equation $x^2 - 5x + 6 = 0$ and explain every step.',
    final: '$x = 2$ or $x = 3$',
    steps: [['Factor', 'Find two numbers that multiply to $6$ and add to $-5$: they are $-2$ and $-3$.\n\n$$x^2 - 5x + 6 = (x-2)(x-3)$$'],
      ['Set each factor to zero', '$$x-2=0 \\Rightarrow x=2 \\qquad x-3=0 \\Rightarrow x=3$$'],
      ['Check', 'Substitute back: $2^2-5(2)+6=0$ and $3^2-5(3)+6=0$.']],
    other: { mode: 'answer', final: '$x = 2$ or $x = 3$', steps: [['Factor', '$(x-2)(x-3)=0$']] } },
  { n: 2, subject: 'math', tags: ['algebra', 'long'], mode: 'answer', verified: 'unchecked',
    text: 'Expand $(a+b)^{10}$ using the binomial theorem.',
    final: '$a^{10} + 10a^9b + 45a^8b^2 + \\dots + b^{10}$',
    steps: [['Binomial theorem', '$$(a+b)^{10} = a^{10} + 10a^9b + 45a^8b^2 + 120a^7b^3 + 210a^6b^4 + 252a^5b^5 + 210a^4b^6 + 120a^3b^7 + 45a^2b^8 + 10ab^9 + b^{10}$$'],
      ['Coefficients', 'They come from row 10 of Pascal\'s triangle: $1, 10, 45, 120, 210, 252, \\dots$']] },
  { n: 3, subject: 'math', tags: ['calculus'], mode: 'learn', verified: 'match',
    text: 'Evaluate the definite integral of $\\sin x \\cos x$ from $0$ to $\\pi/2$.', final: '$\\tfrac{1}{2}$',
    steps: [['Substitute', 'Let $u = \\sin x$, so $du = \\cos x\\,dx$.'],
      ['Integrate', '$$\\int_0^{\\pi/2} \\sin x\\cos x\\,dx = \\left[\\tfrac{1}{2}\\sin^2 x\\right]_0^{\\pi/2} = \\tfrac{1}{2}$$']] },
  { n: 4, subject: 'physics', tags: ['kinematics'], mode: 'answer', verified: 'match',
    text: 'A car accelerates from rest at 3 m/s^2 for 8 s. How far does it travel and what is its final speed?',
    final: '$s = 96\\ \\text{m}$, $v = 24\\ \\text{m/s}$',
    steps: [['Known values', '$u=0$, $a=3\\ \\text{m/s}^2$, $t=8\\ \\text{s}$.'],
      ['Distance', '$$s = ut + \\tfrac{1}{2}at^2 = \\tfrac{1}{2}(3)(8)^2 = 96\\ \\text{m}$$'],
      ['Final speed', '$$v = u + at = 3\\times 8 = 24\\ \\text{m/s}$$']] },
  { n: 5, subject: 'physics', tags: ['forces'], mode: 'learn', verified: 'unchecked',
    text: 'A 2.5 kg block is pulled across a table with 12 N. Friction is 4.0 N. What is its acceleration?',
    final: '$a = 3.2\\ \\text{m/s}^2$',
    steps: [['Net force', '$F_{net} = 12 - 4.0 = 8.0\\ \\text{N}$'],
      ['Newton\'s second law', '$$a = \\frac{F_{net}}{m} = \\frac{8.0\\ \\text{N}}{2.5\\ \\text{kg}} = 3.2\\ \\text{m/s}^2$$']] },
  { n: 6, subject: 'chemistry', tags: ['balancing'], mode: 'answer', verified: 'unchecked',
    text: 'Balance the equation: C3H8 + O2 -> CO2 + H2O',
    final: '$\\text{C}_3\\text{H}_8 + 5\\text{O}_2 \\to 3\\text{CO}_2 + 4\\text{H}_2\\text{O}$',
    steps: [['Carbon', 'Three carbons on the left means $3\\,\\text{CO}_2$.'], ['Hydrogen', 'Eight hydrogens means $4\\,\\text{H}_2\\text{O}$.'],
      ['Oxygen', 'Oxygen on the right is $6+4=10$, so $5\\,\\text{O}_2$.']] },
  { n: 7, subject: 'chemistry', tags: ['moles'], mode: 'learn', verified: 'mismatch',
    text: 'What is the molarity of a solution with 11.7 g of NaCl in 500 mL of water?', final: '$0.40\\ \\text{mol/L}$',
    steps: [['Moles', '$n = 11.7 / 58.5 = 0.20\\ \\text{mol}$'], ['Molarity', '$$c = \\frac{0.20\\ \\text{mol}}{0.500\\ \\text{L}} = 0.40\\ \\text{mol/L}$$']] },
  { n: 8, subject: 'biology', tags: ['cells'], mode: 'answer', verified: 'unchecked',
    text: 'What happens in each phase of mitosis?', final: 'One cell divides into two identical daughter cells.',
    steps: [['Prophase', 'Chromosomes condense and the spindle starts to form.'], ['Metaphase', 'Chromosomes line up at the cell\'s equator.'],
      ['Anaphase', 'Sister chromatids are pulled apart.'], ['Telophase', 'Two nuclei form and the cell splits.']] },
  { n: 9, subject: 'biology', tags: ['cells', 'long-word'], mode: 'answer', verified: 'unchecked',
    text: `${LONG_WORD} is a very long unbroken word; what is osmosis?`, final: 'Water moving across a membrane toward the higher solute concentration.',
    steps: [['Idea', 'Water moves through a semi-permeable membrane.']] },
  { n: 10, subject: 'coding', tags: ['python'], starred: true, mode: 'answer', verified: 'unchecked',
    text: 'Write a Python function that returns the n-th Fibonacci number efficiently.', final: 'Use iteration: O(n) time, O(1) space.',
    steps: [['Idea', 'Keep only the last two values instead of recursing.'],
      ['Code', `\`\`\`python\ndef fib(n: int) -> int:\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a\n\n${LONG_LINE}\n\`\`\``]] },
  { n: 11, subject: 'coding', tags: ['algorithms'], mode: 'learn', verified: 'match',
    text: 'Explain binary search and give its time complexity.', final: 'Binary search runs in $O(\\log n)$ on a sorted list.',
    steps: [['Idea', 'Compare with the middle element and discard half the list each time.'],
      ['Code', '```js\nfunction search(a, x) {\n  let lo = 0, hi = a.length - 1;\n  while (lo <= hi) {\n    const mid = (lo + hi) >> 1;\n    if (a[mid] === x) return mid;\n    a[mid] < x ? (lo = mid + 1) : (hi = mid - 1);\n  }\n  return -1;\n}\n```']] },
  { n: 12, subject: 'history', tags: ['modern-history'], mode: 'learn', verified: 'unchecked',
    text: 'Why did the Industrial Revolution begin in Britain rather than elsewhere in Europe?',
    final: 'A mix of coal, capital, colonial markets, institutions and technology.',
    steps: [['Resources', 'Accessible **coal** and iron ore near each other and near ports.'],
      ['Institutions', 'Secure property rights, patents and a stable banking system encouraged investment.'],
      ['Markets', 'Colonies supplied raw cotton and bought finished textiles.']] },
  { n: 13, subject: 'history', tags: ['essay'], mode: 'answer', verified: 'unchecked',
    text: 'Compare the causes of the French and the Russian revolutions.\nConsider the role of the economy.\nConsider the role of the army.\nConsider the role of new ideas.\nGive two similarities and two differences.',
    final: 'Both followed fiscal crisis and elite failure; they differ in who led them and in the role of war.',
    steps: [['Similarities', 'Both came after state bankruptcy or military defeat and a loss of faith in the ruler.'], ['Differences', 'The French revolution began with the middle class; the Russian one was driven by workers and soldiers.']] },
  { n: 14, subject: 'commerce', tags: ['accounting'], mode: 'answer', verified: 'match',
    text: 'Fixed costs are 12,000 and each unit sells for 50 with a variable cost of 30. What is the break-even quantity?',
    final: '$600\\ \\text{units}$',
    steps: [['Contribution per unit', '$50 - 30 = 20$'], ['Break-even', '$$Q = \\frac{12000}{20} = 600$$']] },
];

export const DEMO_NOTES = [
  { n: 1, title: 'Photosynthesis summary', subject: 'biology' as Subject, source: 'paste' as const, tags: ['cells', 'exam'],
    text: 'Photosynthesis converts light energy into chemical energy. The light reactions in the thylakoid make ATP and NADPH; the Calvin cycle in the stroma uses them to fix CO2 into sugar.',
    summary: 'Light reactions make ATP and NADPH; the Calvin cycle builds sugar.', keyTerms: ['chlorophyll', 'thylakoid', 'Calvin cycle'] },
  { n: 2, title: 'Newton\'s laws cheat sheet', subject: 'physics' as Subject, source: 'file' as const, tags: ['forces'],
    text: 'First law: no net force, no change in motion. Second law: F = ma. Third law: every action has an equal and opposite reaction.',
    cheatsheet: '1) inertia  2) F = ma  3) action-reaction', keyTerms: ['inertia', 'net force'] },
  { n: 3, title: 'Causes of the First World War', subject: 'history' as Subject, source: 'pdf' as const, tags: ['modern-history'],
    text: 'Alliances, militarism, imperial rivalry and nationalism created tension; the assassination in Sarajevo in 1914 triggered the chain of declarations of war.',
    summary: 'Alliances, militarism, empire and nationalism, then Sarajevo.', keyTerms: ['alliances', 'militarism'] },
];
