import EmptyState from "../common/EmptyState.jsx"; import FishCard from "./FishCard.jsx";
export default function FishGrid({ fish = [], onAdd }) { return fish.length?<div className="fish-grid">{fish.map(item=><FishCard key={item._id} fish={item} onAdd={onAdd}/>)}</div>:<EmptyState title="No guppies found" message="Try another search or check back soon."/>; }
