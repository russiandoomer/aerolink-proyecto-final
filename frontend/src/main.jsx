import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import App from './App';
import 'leaflet/dist/leaflet.css';
import './styles/global.css';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <App />
        <ToastContainer
            position="top-right"
            autoClose={2800}
            theme="colored"
            hideProgressBar={false}
        />
    </BrowserRouter>
);
