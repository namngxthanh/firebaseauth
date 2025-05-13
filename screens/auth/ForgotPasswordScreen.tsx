// ForgotPasswordScreen.tsx – cải tiến giao diện đồng bộ với theme & UX
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTheme } from "../../context/ThemeContext";

const translations = {
    vi: {
        email: "Email",
        reset: "Gửi email đặt lại mật khẩu",
        login: "Quay lại đăng nhập",
        invalidEmail: "Email không hợp lệ",
        required: "Bắt buộc",
        success: "Đã gửi email khôi phục mật khẩu!",
    },
    en: {
        email: "Email",
        reset: "Send Password Reset Email",
        login: "Back to Login",
        invalidEmail: "Invalid email",
        required: "Required",
        success: "Password reset email sent!",
    },
};

const ForgotPasswordScreen: React.FC<NativeStackScreenProps<any>> = ({
    navigation,
}) => {
    const { isDarkMode, toggleTheme, theme } = useTheme();
    const [language, setLanguage] = useState<"vi" | "en">("vi");
    const [feedback, setFeedback] = useState("");
    const [errorState, setErrorState] = useState("");
    const t = translations[language];

    const ForgotSchema = Yup.object().shape({
        email: Yup.string().email(t.invalidEmail).required(t.required),
    });

    const handleReset = async (values: { email: string }) => {
        try {
            await sendPasswordResetEmail(auth, values.email);
            setFeedback(t.success);
            setErrorState("");
        } catch (error: any) {
            setErrorState(error.message);
            setFeedback("");
        }
    };

    return (
        <ScrollView
            contentContainerStyle={[
                styles.container,
                { backgroundColor: theme.background },
            ]}
        >
            <View style={styles.headerRow}>
                <TouchableOpacity
                    onPress={() => setLanguage(language === "vi" ? "en" : "vi")}
                    style={[
                        styles.toggleButton,
                        {
                            backgroundColor: theme.inputBg,
                            borderColor: theme.border,
                        },
                    ]}
                >
                    <Text style={[styles.toggleText, { color: theme.text }]}>
                        {language.toUpperCase()}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={toggleTheme}
                    style={[
                        styles.toggleButton,
                        {
                            backgroundColor: theme.inputBg,
                            borderColor: theme.border,
                        },
                    ]}
                >
                    <Text style={[styles.toggleText, { color: theme.text }]}>
                        {isDarkMode ? "🌙" : "☀️"}
                    </Text>
                </TouchableOpacity>
            </View>

            <Text style={[styles.title, { color: theme.text }]}>{t.reset}</Text>

            <Formik
                initialValues={{ email: "" }}
                validationSchema={ForgotSchema}
                onSubmit={handleReset}
            >
                {({
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    values,
                    errors,
                    touched,
                }) => (
                    <View>
                        <TextInput
                            placeholder={t.email}
                            placeholderTextColor={theme.placeholder}
                            style={[
                                styles.input,
                                {
                                    backgroundColor: theme.inputBg,
                                    color: theme.inputText,
                                    borderColor: theme.border,
                                },
                            ]}
                            onChangeText={handleChange("email")}
                            onBlur={handleBlur("email")}
                            value={values.email}
                        />
                        {touched.email && errors.email && (
                            <Text style={styles.error}>{errors.email}</Text>
                        )}
                        {errorState !== "" && (
                            <Text style={styles.error}>{errorState}</Text>
                        )}
                        {feedback !== "" && (
                            <Text style={styles.success}>{feedback}</Text>
                        )}

                        <TouchableOpacity
                            onPress={() => handleSubmit()}
                            style={[
                                styles.button,
                                { backgroundColor: theme.button[0] },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.buttonText,
                                    { color: theme.buttonText },
                                ]}
                            >
                                {t.reset}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => navigation.navigate("Login")}
                        >
                            <Text style={[styles.link, { color: theme.text }]}>
                                {t.login}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </Formik>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 24,
        justifyContent: "center",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    toggleButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    toggleText: {
        fontSize: 14,
        fontWeight: "500",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 24,
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        fontSize: 16,
    },
    error: {
        color: "red",
        marginBottom: 8,
    },
    success: {
        color: "green",
        marginBottom: 8,
    },
    button: {
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        marginVertical: 16,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    link: {
        fontSize: 14,
        textAlign: "center",
        textDecorationLine: "underline",
        marginTop: 10,
    },
});

export default ForgotPasswordScreen;
