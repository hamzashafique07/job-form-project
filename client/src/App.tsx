/** @format */

//client/src/App.tsx
/** @format */

import MultiStepForm from "./components/form/MultiStepForm";
import "react-datepicker/dist/react-datepicker.css";
import Navbar from "./components/form/Navbar";

export default function App() {
  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-left pl-40">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
              Form Project
            </h1>
            <MultiStepForm />
          </div>
        </div>
      </div>
    </div>
  );
}
