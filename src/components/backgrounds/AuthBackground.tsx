'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AuthBackgroundProps {
  children: React.ReactNode;
}

const AuthBackground: React.FC<AuthBackgroundProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Formas geométricas animadas */}
      <div className="absolute inset-0 z-0 opacity-40">
        {/* Círculo grande no canto superior direito */}
        <motion.div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500"
          initial={{ scale: 0.9, opacity: 0.5 }}
          animate={{ 
            scale: [0.9, 1.1, 0.9],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Círculo médio no canto inferior esquerdo */}
        <motion.div
          className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-gradient-to-r from-purple-400 to-pink-500"
          initial={{ scale: 0.8, opacity: 0.4 }}
          animate={{ 
            scale: [0.8, 1, 0.8],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        {/* Forma irregular semi-transparente centralizada */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-tr from-yellow-300 to-orange-400 rounded-br-3xl rounded-tl-3xl"
          initial={{ rotate: 0, opacity: 0.3, borderRadius: "30% 60% 70% 40%" }}
          animate={{ 
            rotate: 360,
            opacity: [0.3, 0.4, 0.3],
            borderRadius: ["30% 60% 70% 40%", "60% 30% 40% 70%", "30% 60% 70% 40%"]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
      
      {/* Padrão de grade - opcional */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48cGF0aCBkPSJNNTkuNSA1OS41VjU4LjVINTguNVY1OS41SDU5LjVaTTU5LjUgMC41SDU4LjVWMS41SDU5LjVWMC41Wk0wLjUgMC41VjEuNUgxLjVWMC41SDAuNVpNMC41IDU5LjVIMC41VjU4LjVIMS41VjU5LjVIMC41Wk01OS41IDYwQzU5Ljc3NjEgNjAgNjAgNTkuNzc2MSA2MCA1OS41SDU5QzU5IDU5LjIyMzkgNTkuMjIzOSA1OSA1OS41IDU5VjYwWk01OS41IDU5LjVINTkuNVY2MEM1OS43NzYxIDYwIDYwIDU5Ljc3NjEgNjAgNTkuNUg1OS41Wk01OC41IDU5LjVDNTguNSA1OS43NzYxIDU4LjcyMzkgNjAgNTkgNjBWNTlDNTkuMjIzOSA1OSA1OS41IDU5LjIyMzkgNTkuNSA1OS41SDU4LjVaTTU4LjUgNTguNVY1OS41SDU5LjVWNTguNUg1OC41Wk01OS41IDAuNUM1OS41IDAuMjIzODU4IDU5LjI3NjEgMCA1OSAwVjFDNTkuMjIzOSAxIDU5IDEuMjIzODYgNTkgMC41SDU5LjVaTTU5LjUgMC41VjAuNUg2MEM2MCAwLjIyMzg1OCA1OS43NzYxIDAgNTkuNSAwVjAuNVpNNTguNSAwLjVDNTguNSAwLjIyMzg1OCA1OC43MjM5IDAgNTkgMFYxQzU4LjIyMzkgMSA1OC41IDAuNzc2MTQyIDU4LjUgMC41SDU4LjVaTTU4LjUgMS41VjAuNUg1Ny41VjEuNUg1OC41Wk0wLjUgMC41QzAuNSAwLjc3NjE0MiAwLjc3NjE0MiAxIDEgMVYwQzAuMjIzODU4IDAgMCAwLjIyMzg1OCAwIDAuNUgwLjVaTTAuNSAwLjVIMC41VjBDMC4yMjM4NTggMCAwIDAuMjIzODU4IDAgMC41SDAuNVpNMS41IDAuNUMxLjUgMC4yMjM4NTggMS4yMjM4NiAwIDEgMFYxQzAuNzc2MTQyIDEgMC41IDAuNzc2MTQyIDAuNSAwLjVIMS41Wk0xLjUgMS41VjAuNUgwLjVWMS41SDEuNVpNMC41IDU5LjVDMC41IDU5Ljc3NjEgMC43NzYxNDIgNjAgMSA2MFY1OUMwLjc3NjE0MiA1OSAwLjUgNTkuMjIzOSAwLjUgNTkuNUgwLjVaTTAuNSA1OS41VjU5LjVIMEM5LjM0MTJlLTUgNTkuNzc2MSAwLjIyMzg1OCA2MCAwLjUgNjBWNTkuNVpNMS41IDU5LjVDMS41IDU5LjIyMzkgMS4yMjM4NiA1OSAxIDU5VjYwQzEuMjIzODYgNjAgMS41IDU5Ljc3NjEgMS41IDU5LjVIMS41Wk0xLjUgNTguNVY1OS41SDAuNVY1OC41SDEuNVpNMjkuNSA1OS41VjU4LjVIMjguNVY1OS41SDI5LjVaTTI5LjUgMC41SDI4LjVWMS41SDI5LjVWMC41Wk0zMC41IDAuNUgyOS41VjEuNUgzMC41VjAuNVpNMzAuNSA1OS41SDMwLjVWNTguNUgyOS41VjU5LjVIMzAuNVpNMzAuNSA1OS41VjU5LjVIMjkuNVY1OS41SDMwLjVaTTU5LjUgMjkuNUg1OC41VjMwLjVINTkuNVYyOS41Wk0wLjUgMjkuNUgwLjVWMzAuNUgxLjVWMjkuNUgwLjVaTTMwLjUgMzAuNVYyOS41SDI5LjVWMzAuNUgzMC41Wk0zMC41IDMwLjVIMzAuNVYyOS41SDI5LjVWMzAuNUgzMC41Wk0zMC41IDMwLjVWMzAuNUgyOS41VjMwLjVIMzAuNVpNMzAuNSAzMC41SDE1LjVWMzEuNUgzMC41VjMwLjVaTTE1LjUgMzAuNUgwLjVWMzEuNUgxNS41VjMwLjVaTTMwLjUgMzAuNUg0NS41VjI5LjVIMzAuNVYzMC41Wk00NS41IDMwLjVINTkuNVYyOS41SDQ1LjVWMzAuNVpNMzAuNSAxNS41VjMwLjVIMzEuNVYxNS41SDMwLjVaTTMwLjUgMTUuNVYwLjVIMjkuNVYxNS41SDMwLjVaTTMwLjUgNDUuNVYzMC41SDI5LjVWNDUuNUgzMC41Wk0zMC41IDQ1LjVWNTkuNUgzMS41VjQ1LjVIMzAuNVpNNDUuNSAxLjVWMC41SDQ0LjVWMS41SDQ1LjVaTTQ1LjUgMTUuNVYxLjVINDQuNVYxNS41SDQ1LjVaTTQ1LjUgMTUuNVYxNS41SDQ0LjVWMTUuNUg0NS41Wk0xNS41IDEuNVYwLjVIMTQuNVYxLjVIMTUuNVpNMTUuNSAxNS41VjEuNUgxNC41VjE1LjVIMTUuNVpNMTUuNSAxNS41VjE1LjVIMTQuNVYxNS41SDE1LjVaTTQ1LjUgNTguNVY1OS41SDQ0LjVWNTguNUg0NS41Wk00NS41IDQ1LjVWNTguNUg0NC41VjQ1LjVINDUuNVpNNDUuNSA0NS41VjQ1LjVINDQuNVY0NS41SDQ1LjVaTTE1LjUgNTguNVY1OS41SDE0LjVWNTguNUgxNS41Wk0xNS41IDQ1LjVWNTguNUgxNC41VjQ1LjVIMTUuNVpNMTUuNSA0NS41VjQ1LjVIMTQuNVY0NS41SDE1LjVaTTQ1LjUgMTUuNUgzMC41VjE2LjVINDUuNVYxNS41Wk00NS41IDE1LjVWMTUuNUg0NC41VjE1LjVINDUuNVpNMTUuNSAxNS41SDBWMTYuNUgxNS41VjE1LjVaTTE1LjUgMTUuNVYxNS41SDE0LjVWMTUuNUgxNS41Wk0zMC41IDE1LjVIMTUuNVYxNi41SDMwLjVWMTUuNVpNNDUuNSA0NS41SDMwLjVWNDYuNUg0NS41VjQ1LjVaTTQ1LjUgNDUuNVY0NS41SDQ0LjVWNDUuNUg0NS41Wk0xNS41IDQ1LjVIMFY0Ni41SDE1LjVWNDUuNVpNMTUuNSA0NS41VjQ1LjVIMTQuNVY0NS41SDE1LjVaTTMwLjUgNDUuNUgxNS41VjQ2LjVIMzAuNVY0NS41WiIgZmlsbD0iIzAwMDAwMCIvPjwvc3ZnPg==')]"></div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-4xl p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthBackground; 