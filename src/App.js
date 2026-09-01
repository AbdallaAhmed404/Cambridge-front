import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './Pages/Home';
import NotFound from './Pages/NotFound';
import Login from './Pages/Authentication/Login';
import SignUp from './Pages/Authentication/SignUp';
import Contact from './Pages/Contact';
import AllProducts from './Component/AllProducts';
import { Toaster } from 'react-hot-toast';
import ForgetPassword from './Pages/Authentication/ForgetPassword';
import ResetPassword from './Pages/Authentication/ResetPassword';
import BookViewer from './Component/BookViewer';
import ActivateAccount from './Component/ActivateAccount';
import ResendActivation from './Pages/Authentication/ResendActivation';
import CodeCheckerPage from './Component/CodeCheckerPage';
import SelectRole from './Pages/Authentication/SelectRole';
import ViewTeacherResource from './Component/ViewTeacherResource';
import DigitalBookViewer from './Component/DigitalBookViewer';
import ResourceFilesPage from './Component/ResourceFilesPage';
import TeacherBookViewer from './Component/TeacherBookViewer';

function App() {
  return (
    <>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/go/" element={<Home />} />
            <Route path="/activate-account/:token" element={<ActivateAccount />} />
            <Route path="/view-teacher-resource/:resourceId" element={<ViewTeacherResource />} />
            <Route path="/resource/:resourceId/:type" element={<ResourceFilesPage />} />
            <Route path="/accounts/resend-activation/" element={<ResendActivation />} />
            <Route path="/go/codecheck" element={<CodeCheckerPage />} />
            <Route path="/" element={<Home />} />
            <Route path="/accounts/register/" element={<SignUp />} />
            <Route path="/accounts/select-role" element={<SelectRole />} />
            <Route path="/accounts/login/" element={<Login />} />
            <Route path="/support" element={<Contact />} />
            <Route path="/go/resources/" element={<AllProducts />} />
            <Route path="/view-book/:id" element={<BookViewer />} />
            <Route path="/TeacherBookViewer/:id" element={<TeacherBookViewer/>} />
            <Route path="/view-digital-book/:id" element={<DigitalBookViewer />} />
            <Route path="/Forget-Password" element={<ForgetPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;
