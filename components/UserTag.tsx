// components/UserTag.tsx

interface UserTagProps {
  label: string
  textColor: string
  bgColor: string
}

export default function UserTag({ label, textColor, bgColor }: UserTagProps) {
  return (
    <span
      className="font-bold uppercase tracking-widest"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontSize: '9px',
        letterSpacing: '1.5px',
        verticalAlign: 'middle',
        padding: '2px 6px',
        display: 'inline-block',
      }}
    >
      {label}
    </span>
  )
}