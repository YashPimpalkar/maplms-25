import React, { useEffect, useState } from "react";
import { Disclosure, Menu, MenuButton } from "@headlessui/react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import DesktopNav from "../components/Navbar/DesktopNav";
import MobileNav from "../components/Navbar/MobileNav";
import UserMenu from "../components/Navbar/UserMenu";
import { getNavigationByUserType } from "../constants/utils"
import api from "../api.js"
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../components/Navbar/logo2.png"
import { FaBell } from "react-icons/fa";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState("");
  const [user_id, setUID] = useState(0);
  const [student_id, setSID] = useState(0);
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = window.localStorage.getItem("token");
    const storedUserType = window.localStorage.getItem("user_type");
    if (storedToken && storedUserType && storedUserType != 1) {
      setToken(storedToken);
      setUserType(parseInt(storedUserType));
      const uid = window.localStorage.getItem("uid");
      const isRegister = window.localStorage.getItem("isregister");
      setIsLoggedIn(true)
      if (uid && isRegister) {
        setUID(parseInt(uid));
        const fetchEmail = async () => {
          try {
            const response = await api.post(`api/register/getemail/${uid}`);
            if (response.data && response.data.length > 0) {
              setEmail(response.data[0].emailid);
            }
          } catch (err) {
            console.error("Failed to fetch email:", err);
          }
        };
        fetchEmail();
      }
    } else if (storedToken && storedUserType == 1) {
      setToken(storedToken);
      setUserType(parseInt(storedUserType));
      setIsLoggedIn(true)
      const sid = window.localStorage.getItem("sid");
      const isRegister = window.localStorage.getItem("isregister");
      if (sid && isRegister) {
        setSID(parseInt(sid));
        const fetchStudentEmail = async () => {
          try {
            const response = await api.get(`api/register/student/getemail/${sid}`);
            if (response.data && response.data.length > 0) {
              setEmail(response.data[0].emailid);
            }
          } catch (err) {
            console.error("Failed to fetch email:", err);
          }
        };
        fetchStudentEmail();
      }
    }
  }, []);
  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const navigation = getNavigationByUserType(userType);

  return (
    <header className="fixed w-full top-0 left-0 z-50 bg-blue-900 shadow-lg">
      <Disclosure as="nav" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {({ open }) => (
          <>
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-blue-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-all duration-200">
                  <span className="sr-only">Open main menu</span>
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                </Disclosure.Button>
              </div>
              
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex shrink-0 items-center">
                  <img
                    className="h-10 w-auto transition-transform duration-200 hover:scale-105"
                    src={logo}
                    alt="MapLMS"
                  />
                </div>
                <DesktopNav navigation={navigation} />
              </div>
              
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {/* Notification Bell - Only visible for students */}
                {userType === 1 && (
                  <button
                    onClick={handleNotificationClick}
                    className="mr-4 p-1 rounded-full text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200"
                    aria-label="Notifications"
                  >
                    <FaBell className="h-6 w-6" />
                  </button>
                )}
                
                <Menu as="div" className="relative ml-3">
                  <div>
                    <MenuButton className="flex rounded-full bg-white p-1 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-all duration-200 hover:scale-105">
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="h-8 w-8 rounded-full object-cover"
                        src="/images/man.png"
                        alt="User"
                      />
                    </MenuButton>
                  </div>
                  <UserMenu isLoggedIn={isLoggedIn} email={email}/>
                </Menu>
              </div>
            </div>
            
            <MobileNav navigation={navigation} />
          </>
        )}
      </Disclosure>
    </header>
  );
};

export default Header;
