import './App.css';
import { Route, Switch, Redirect } from 'react-router-dom';
import Homepage from './Pages/Homepage';
import ChatPage from './Pages/Chatpage';

function App() {
  return (
    <div className="App">
      <Switch>
        <Route path="/" component={Homepage} exact />
        <Route path="/chats" component={ChatPage} />
        <Redirect to="/" />
      </Switch>
    </div>
  );
}

export default App;
