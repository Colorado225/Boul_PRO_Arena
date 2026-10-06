import type {ButtonHTMLAttributes,HTMLAttributes,ReactNode} from 'react';

export function Surface({className='',...props}:HTMLAttributes<HTMLDivElement>){return <div className={`bg-white border border-[#e5e6df] rounded-[22px] ${className}`} {...props}/>}
export function ActionButton({className='',children,...props}:ButtonHTMLAttributes<HTMLButtonElement>){return <button className={`h-10 px-4 rounded-xl bg-[#172219] text-white text-xs font-bold disabled:opacity-50 ${className}`} {...props}>{children}</button>}
export function StatusBadge({children}:{children:ReactNode}){return <span className="inline-flex rounded-full bg-[#e7f7ce] px-2 py-1 text-[10px] font-bold text-[#4d7316]">{children}</span>}
