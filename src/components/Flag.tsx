interface FlagProps {
  code: string;
  size?: 'sm' | 'md';
  className?: string;
  alt?: string;
}

export function Flag({ code, size = 'md', className, alt }: FlagProps) {
  const w = size === 'sm' ? 40 : 80;
  return (
    <img
      src={`https://flagcdn.com/w${w}/${code}.png`}
      srcSet={`https://flagcdn.com/w${w * 2}/${code}.png 2x`}
      alt={alt ?? ''}
      className={className ?? (size === 'sm' ? 'team-mini-flag' : 'team-card-flag')}
      loading="lazy"
    />
  );
}
