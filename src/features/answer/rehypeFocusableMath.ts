/** Wide display equations scroll inside their own box, so keyboard users must be able to focus (and scroll) them. */
interface Hast { tagName?: string; properties?: Record<string, unknown>; children?: Hast[] }

export function rehypeFocusableMath() {
  return (tree: Hast) => {
    const walk = (n: Hast): void => {
      const cls = n.properties?.className;
      if (n.tagName === 'span' && Array.isArray(cls) && cls.includes('katex-display')) {
        n.properties = { ...n.properties, tabIndex: 0, role: 'group', ariaLabel: 'Equation, scrolls sideways if wide' };
      }
      n.children?.forEach(walk);
    };
    walk(tree);
  };
}
