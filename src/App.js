import "bulma/css/bulma.css";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ContactPage from "./pages/ContactPage";
import Root from "./pages/Root";
import ProvidersPage from "./pages/ProvidersPage";
import ProvDetailsPage from "./pages/ProvDetailsPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <ProvidersPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "/provider/:name", element: <ProvDetailsPage /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
