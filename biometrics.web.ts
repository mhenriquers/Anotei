//---------------------- biometria: versão web ----------------------
// O navegador não tem desbloqueio por digital para o app: a opção nem aparece.
export const canUseBiometrics = async (): Promise<boolean> => false;
export const authenticate = async (): Promise<boolean> => true;
