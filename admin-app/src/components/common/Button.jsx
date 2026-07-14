export default function Button({children,variant="primary",...props}){return <button className={`admin-button ${variant}`} {...props}>{children}</button>}
