import './App.css';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Homepage from './Pages/Homepage';
import ChatPage from './Pages/Chatpage';
import ChatProvider from './Context/ChatProvider';

function App() {
  return (
    <Router>
      <ChatProvider>
        <div className="App">
          <Switch>
            <Route path="/" component={Homepage} exact />
            <Route path="/chats" component={ChatPage} />
            <Redirect to="/" />
          </Switch>
        </div>
      </ChatProvider>
    </Router>
  );
}

export default App;
