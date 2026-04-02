import type { TranslationNamespaces } from "../../types/namespaces";

export const login: TranslationNamespaces["login"] = {

    title: "Logg inn",
    description:
      "For lokal utvikling: opprett en bruker med e-post og passord i Supabase-dashboardet, og logg inn her uten verifiserings-epost.",
    emailLabel: "E-post",
    emailPlaceholder: "deg@salong.no",
    passwordLabel: "Passord",
    passwordPlaceholder: "Minst 6 tegn",
    loginError: "Kunne ikke logge inn.",
    loggingIn: "Logger inn...",
    loginButton: "Logg inn",
    tip: "Tips: I Supabase kan du midlertidig skru av e-postbekreftelse under Auth > Authentication > Email, slik at nye brukere kan logge inn direkte.",
    welcomeBackTitle: "Velkommen tilbake til TeqBook",
    welcomeBackDescription: "Enkelt salongprogramvare som holder kalenderen, kundene og ansatte synkronisert.",
    bullet1: "Rask booking og gjenbooking for faste kunder",
    bullet2: "Fungerer for enkelt- og flersalong-eiere",
    bullet3: "Bygget for betaling-i-salong-bedrifter",
    trustLine: "Stolt brukt av travle salonger som trenger at dagen bare fungerer.",
    formSubtitle: "Bruk TeqBook-kontoen din for å få tilgang til salongdashbordet.",
    forgotPassword: "Glemt passord?",
    keepMeLoggedIn: "Hold meg innlogget",
    dontHaveAccount: "Har du ikke konto?",
    createOne: "Opprett en",
    secureLoginLine: "Sikker innlogging. Passordet ditt lagres aldri i ren tekst.",
};
