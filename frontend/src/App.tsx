import { useAuth } from "./AuthContext";
import Login from "./Login";
import Tasks from "./Tasks";

export default function App() {
  const { token } = useAuth();
  return token ? <Tasks /> : <Login />;
}
