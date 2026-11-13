import React from "react";
import { Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getPaymentInfo } from "../paymentMethods";

interface PaymentIconProps {
  method: string;
  size: number;
  color?: string; // se não vier, usa a cor da forma de pagamento
  muted?: boolean; // cinza (opção não selecionada no cadastro)
  mutedColor?: string;
}

//---------------------- ícone da forma de pagamento ----------------------
// O Pix usa a imagem do logo; as outras formas usam ícones do Ionicons.
const PaymentIcon: React.FC<PaymentIconProps> = ({
  method,
  size,
  color,
  muted,
  mutedColor,
}) => {
  const info = getPaymentInfo(method);

  if (info.image) {
    // a imagem tem margem em volta do desenho: um pouco maior fica do tamanho dos ícones
    const imageSize = Math.round(size * 1.3);
    return (
      <Image
        source={info.image}
        style={[
          {
            width: imageSize,
            height: imageSize,
            margin: (size - imageSize) / 2,
          },
          muted && { tintColor: mutedColor },
        ]}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    );
  }

  return (
    <Ionicons
      name={info.icon}
      size={size}
      color={muted ? mutedColor : (color ?? info.color)}
    />
  );
};

export default PaymentIcon;
