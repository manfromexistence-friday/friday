export default {
  'code[class*="language-"]': {
    color: 'hsl(var(--foreground))',
    fontFamily: 'var(--font-geist-mono)',
    direction: 'ltr',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    lineHeight: '1.5',
    MozTabSize: '4',
    OTabSize: '4',
    tabSize: '4',
    WebkitHyphens: 'none',
    MozHyphens: 'none',
    msHyphens: 'none',
    hyphens: 'none',
    fontSize: 12,
  },
  'pre[class*="language-"]': {
    color: 'hsl(var(--foreground))',
    fontFamily: 'var(--font-geist-mono)',
    direction: 'ltr',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    lineHeight: '1.5',
    MozTabSize: '4',
    OTabSize: '4',
    tabSize: '4',
    WebkitHyphens: 'none',
    MozHyphens: 'none',
    msHyphens: 'none',
    hyphens: 'none',
    padding: '16px 0px 32px',
    margin: '.5em 0',
    overflow: 'auto',
    borderRadius: '0.3em',
    background: 'hsl(var(--background))',
    fontSize: 12,
    height: '100%',
  },
  ':not(pre) > code[class*="language-"]': {
    background: 'hsl(var(--background))',
    padding: '.1em',
    borderRadius: '.3em',
  },
  comment: {
    color: 'hsl(var(--muted-foreground))',
  },
  prolog: {
    color: 'hsl(var(--muted-foreground))',
  },
  doctype: {
    color: 'hsl(var(--muted-foreground))',
  },
  cdata: {
    color: 'hsl(var(--muted-foreground))',
  },
  punctuation: {
    color: 'hsl(var(--foreground))',
  },
  '.namespace': {
    Opacity: '.7',
  },
  property: {
    color: 'hsl(var(--muted))',
  },
  keyword: {
    color: 'hsl(var(--muted))',
  },
  tag: {
    color: 'hsl(var(--muted))',
  },
  'class-name': {
    color: 'hsl(var(--warning))',
    textDecoration: 'underline',
  },
  boolean: {
    color: 'hsl(var(--primary))',
  },
  constant: {
    color: 'hsl(var(--primary))',
  },
  symbol: {
    color: 'hsl(var(--destructive))',
  },
  deleted: {
    color: 'hsl(var(--destructive))',
  },
  number: {
    color: 'hsl(var(--secondary))',
  },
  selector: {
    color: 'hsl(var(--accent))',
  },
  'attr-name': {
    color: 'hsl(var(--accent))',
  },
  string: {
    color: 'hsl(var(--accent))',
  },
  char: {
    color: 'hsl(var(--accent))',
  },
  builtin: {
    color: 'hsl(var(--accent))',
  },
  inserted: {
    color: 'hsl(var(--accent))',
  },
  variable: {
    color: 'hsl(var(--card))',
  },
  operator: {
    color: 'hsl(var(--card-foreground))',
  },
  entity: {
    color: 'hsl(var(--warning))',
    cursor: 'help',
  },
  url: {
    color: 'hsl(var(--muted))',
  },
  '.language-css .token.string': {
    color: 'hsl(var(--border))',
  },
  '.style .token.string': {
    color: 'hsl(var(--border))',
  },
  atrule: {
    color: 'hsl(var(--warning))',
  },
  'attr-value': {
    color: 'hsl(var(--warning))',
  },
  function: {
    color: 'hsl(var(--warning-foreground))',
  },
  regex: {
    color: 'hsl(var(--secondary-foreground))',
  },
  important: {
    color: 'hsl(var(--warning))',
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
};
