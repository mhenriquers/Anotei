import * as LocalAuthentication from "expo-local-authentication";

//---------------------- digital / reconhecimento facial (Android) ----------------------
// Na web o Metro usa biometrics.web.ts, que diz que não há biometria.

// o aparelho tem leitor e a pessoa já cadastrou uma digital (ou rosto)
export const canUseBiometrics = async (): Promise<boolean> => {
  try {
    return (
      (await LocalAuthentication.hasHardwareAsync()) &&
      (await LocalAuthentication.isEnrolledAsync())
    );
  } catch {
    return false;
  }
};

// true = desbloqueou. Se a digital falhar, o Android oferece o PIN/padrão do celular.
export const authenticate = async (): Promise<boolean> => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Desbloquear o Anotei",
      cancelLabel: "Cancelar",
    });
    return result.success;
  } catch {
    return false;
  }
};
