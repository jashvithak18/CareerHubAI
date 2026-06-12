import Footer from "@/Components/Footer";
import Navbar from "@/Components/Navbar";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { store } from "../store/store";
import { Provider, useDispatch } from "react-redux";
import { useEffect } from "react";
import { auth } from "@/firebase/firebase";
import { login, logout } from "@/Feature/Userslice";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from "../utils/api";

export default function App({ Component, pageProps }: AppProps) {
  function AuthListener() {
    const dispatch = useDispatch();
    useEffect(() => {
      auth.onAuthStateChanged(async (authuser) => {
        if (authuser) {
          // Pre-sync login dispatch
          dispatch(
            login({
              uid: authuser.uid,
              photo: authuser.photoURL,
              name: authuser.displayName,
              email: authuser.email,
              phoneNumber: authuser.phoneNumber,
              plan: "free" // Default plan before sync completes
            })
          );

          // Sync profile details with MongoDB and retrieve plan state
          try {
            const syncRes = await api.post("/user/sync", { photo: authuser.photoURL });
            const dbUser = syncRes.data.user;
            dispatch(
              login({
                uid: authuser.uid,
                photo: authuser.photoURL,
                name: authuser.displayName,
                email: authuser.email,
                phoneNumber: authuser.phoneNumber,
                plan: dbUser.plan || "free"
              })
            );
          } catch (err) {
            console.error("Failed to sync user with MongoDB database:", err);
          }
        } else {
          dispatch(logout());
        }
      });
    }, [dispatch]);
    return null;
  }

  return (
    <Provider store={store}>
      <AuthListener />
      <div className="bg-white">
        <ToastContainer/>
        <Navbar />
        <Component {...pageProps} />
        <Footer />
      </div>
    </Provider>
  );
}
