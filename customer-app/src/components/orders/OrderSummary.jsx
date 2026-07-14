import { formatCurrency } from "../../utils/currency.js";
export default function OrderSummary({ items = [], onRemove }) { return <div className="cart-list">{items.map(item=><div key={item._id}><span>{item.name}<small>{item.strain}</small></span><b>{formatCurrency(item.price)}</b>{onRemove&&<button onClick={()=>onRemove(item._id)}>Remove</button>}</div>)}</div>; }
