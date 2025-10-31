//client/src/App.tsx
/** @format */

import Navbar from "./components/form/Navbar";
import Home from "./components/form/Home";
import Flow from "./components/form/Flow";
import Banner from "./components/form/Banner";
import Window from "./components/form/Window";
import Faq from "./components/form/Faq";
import ClaimForm1 from "./components/form/Claimf1";

export default function App() {
  return (
    <div>
      <Navbar />
      <Home />
      <Flow />
      <Banner />
      <Window />
      <Faq />
      <ClaimForm1 />
    </div>
  );
}
