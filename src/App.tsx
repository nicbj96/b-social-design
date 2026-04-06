import { Route, Switch } from 'wouter';
import Udforsk from './pages/Udforsk';

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Udforsk} />
      <Route path="/udforsk" component={Udforsk} />
      <Route>404 – siden findes ikke</Route>
    </Switch>
  );
}
