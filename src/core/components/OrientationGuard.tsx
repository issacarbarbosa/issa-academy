import React from 'react';
import { motion } from 'motion/react';
import { useMobileOrientation } from '../hooks/useMobileOrientation';
import { getAssetUrl } from '../utils/paths';

interface OrientationGuardProps {
  children: React.ReactNode;
}

export const OrientationGuard: React.FC<OrientationGuardProps> = ({ children }) => {
  const { isMobile, isPortrait } = useMobileOrientation();

  if (isMobile && isPortrait) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/95 backdrop-blur-md px-6 text-center font-sans">
        {/* Mascote Fufu com animação suave de flutuação */}
        <motion.img
          src={getAssetUrl('assets/fufu-pensativo.png')}
          alt="Mascote Fufu Pensativo"
          className="w-36 h-auto object-contain mb-6 drop-shadow-md"
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        />

        <h2 className="text-2xl font-black text-slate-800 leading-tight">
          Gire o seu celular!
        </h2>
        
        <p className="text-sm text-slate-500 font-extrabold mt-3 max-w-xs leading-relaxed">
          Esta tela foi projetada para ser jogada ou estudada na horizontal (modo paisagem) para podermos exibir a pauta e o teclado perfeitamente.
        </p>

        {/* Animação vetorial e CSS do celular rotacionando */}
        <div className="relative w-28 h-28 mt-8 flex items-center justify-center">
          <motion.div
            className="w-10 h-16 border-4 border-slate-700 rounded-lg relative flex items-center justify-center"
            animate={{ rotate: [0, 90, 90, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", times: [0, 0.4, 0.8, 1] }}
          >
            {/* Botão home do celular simulado */}
            <div className="w-1.5 h-1.5 bg-slate-700 rounded-full absolute bottom-1"></div>
            {/* Detalhe do alto-falante */}
            <div className="w-4 h-0.5 bg-slate-400 absolute top-1 rounded-full"></div>
          </motion.div>

          {/* Seta curva de orientação */}
          <svg className="absolute w-24 h-24 text-indigo-500 stroke-current fill-none" viewBox="0 0 100 100">
            <path
              d="M 25 50 A 25 25 0 0 1 70 25"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="6,4"
            />
            <polygon points="70,20 78,28 65,30" fill="currentColor" stroke="none" />
          </svg>
        </div>

        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider mt-12 animate-pulse">
          Lembre-se de ativar a rotação automática do celular
        </span>
      </div>
    );
  }

  return <>{children}</>;
};
