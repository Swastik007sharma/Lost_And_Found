import { Link } from "react-router-dom";
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import {
    FaBoxOpen,
    FaGithub,
    FaLinkedin,
    FaInstagram,
    FaTwitter,
    FaHeart,
    FaLock
} from 'react-icons/fa';
import {
    FiBell,
    FiGrid,
    FiHome,
    FiFileText,
    FiMail,
    FiMapPin
} from 'react-icons/fi';

const Footer = () => {
    const { theme } = useTheme();
    const currentYear = new Date().getFullYear();

    const socialLinks = [
        {
            name: "GitHub",
            href: "https://github.com/Swastik007sharma/CampusTrack",
            icon: FaGithub,
        },
        {
            name: "Instagram",
            href: "#",
            icon: FaInstagram,
        },
        {
            name: "Twitter",
            href: "#",
            icon: FaTwitter,
        },
        {
            name: "LinkedIn",
            href: "#",
            icon: FaLinkedin,
        },
    ];

    const footerLinks = [
        {
            title: "Navigation",
            links: [
                { name: "Home", href: "/home", icon: FiHome },
                { name: "Notifications", href: "/notifications", icon: FiBell },
                { name: "Dashboard", href: "/dashboard", icon: FiGrid },
            ],
        },
        {
            title: "Support",
            links: [
                { name: "Privacy Policy", href: "/privacy-policy", icon: FaLock },
                { name: "Terms & Conditions", href: "/terms-and-conditions", icon: FiFileText },
                { name: "Contact", href: "mailto:project.k3925@gmail.com", icon: FiMail },
            ],
        },
    ];

    return (
        <footer className={`relative overflow-hidden ${theme === "dark" ? "bg-linear-to-br from-gray-900 via-gray-800 to-gray-900" : "bg-linear-to-br from-gray-50 via-white to-gray-50"}`}>
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 opacity-30">
                <div className={`absolute top-0 left-0 w-64 h-64 rounded-full filter blur-3xl ${theme === "dark" ? "bg-blue-900" : "bg-blue-100"}`}></div>
                <div className={`absolute bottom-0 right-0 w-96 h-96 rounded-full filter blur-3xl ${theme === "dark" ? "bg-purple-900" : "bg-purple-100"}`}></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
                    {/* Brand Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-2"
                    >
                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-linear-to-br from-blue-600 to-purple-600">
                                <FaBoxOpen className="text-white text-xl" />
                            </div>
                            <h2 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                CampusTrack
                            </h2>
                        </div>

                        <p className={`max-w-md text-sm sm:text-base leading-relaxed mb-6 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                            Your campus lost & found hub. Helping students and staff report, find, and manage lost items with seamless tracking and easy communication.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}>
                                    <FiMail className={`w-4 h-4 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
                                </div>
                                <a href="mailto:project.k3925@gmail.com" className={`text-sm hover:text-blue-500 transition-colors ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                                    project.k3925@gmail.com
                                </a>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}>
                                    <FiMapPin className={`w-4 h-4 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
                                </div>
                                <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                                    Your College Campus
                                </span>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            {socialLinks.map((social, index) => (
                                <motion.a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0, scale: 0 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    whileHover={{ scale: 1.15, rotate: 5 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md hover:shadow-xl transition-all duration-300 ${theme === "dark"
                                        ? "bg-gray-800 text-gray-400 hover:bg-blue-600 hover:text-white"
                                        : "bg-white text-gray-600 hover:bg-blue-600 hover:text-white"
                                        }`}
                                >
                                    <social.icon className="w-5 h-5" />
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Links Sections */}
                    {footerLinks.map((section, sectionIndex) => (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 + sectionIndex * 0.1 }}
                        >
                            <h3 className={`font-bold mb-5 text-base uppercase tracking-wider ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                                {section.title}
                            </h3>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <motion.li
                                        key={link.name}
                                        whileHover={{ x: 5 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Link
                                            to={link.href}
                                            className={`text-sm flex items-center gap-2 hover:text-blue-500 transition-colors duration-200 group ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                                        >
                                            <link.icon className={`w-4 h-4 transition-all duration-200 ${theme === "dark" ? "text-gray-500 group-hover:text-blue-400" : "text-gray-400 group-hover:text-blue-500"}`} />
                                            <span>{link.name}</span>
                                        </Link>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                {/* Divider */}
                <div className={`border-t mb-8 ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}></div>

                {/* Bottom Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex flex-col md:flex-row justify-between items-center gap-4"
                >
                    {/* Copyright */}
                    <div className={`flex items-center gap-2 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        <span>© {currentYear} CampusTrack. Made with</span>
                        <FaHeart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
                        <span>for students</span>
                    </div>

                    {/* Legal Links */}
                    <div className="flex items-center gap-6">
                        <Link
                            to="/privacy-policy"
                            className={`text-sm hover:text-blue-500 transition-colors ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                        >
                            Privacy Policy
                        </Link>
                        <span className={theme === "dark" ? "text-gray-700" : "text-gray-300"}>•</span>
                        <Link
                            to="/terms-and-conditions"
                            className={`text-sm hover:text-blue-500 transition-colors ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                        >
                            Terms & Conditions
                        </Link>
                    </div>
                </motion.div>

                {/* Trust Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-8 text-center"
                >
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${theme === "dark"
                        ? "bg-gray-800 text-gray-400"
                        : "bg-gray-100 text-gray-600"
                        }`}>
                        <FaLock className="w-3 h-3" />
                        <span className="text-xs font-medium">Secure & Private Platform</span>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
};

export default Footer;
