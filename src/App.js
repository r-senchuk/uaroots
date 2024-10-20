import "bulma/css/bulma.css";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ContactPage from "./pages/ContactPage";
import Root from "./pages/Root";
import ProvidersPage from "./pages/ProvidersPage";
import ProvDetailsPage from "./pages/ProvDetailsPage";
import AboutPage from "./pages/AboutPage";
import ArticlesPage from "./pages/ArticlesPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <ProvidersPage /> },
      { path: "blog/:article", element: <ArticlesPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "/provider/:name", element: <ProvDetailsPage /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
