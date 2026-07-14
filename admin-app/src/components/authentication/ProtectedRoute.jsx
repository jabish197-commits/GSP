import{Navigate}from"react-router-dom";export default function ProtectedRoute({admin,children}){return admin?children:<Navigate to="/login" replace/>}
