import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Formik } from "formik";
import * as Yup from "yup";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useTheme } from "../../context/ThemeContext"; // Dark/Light mode context

const SignupSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Required"),

    password: Yup.string().min(6, "Min 6 characters").required("Required"),

    confirm: Yup.string()
        .required("Required")
        .test("passwords-match", "Passwords must match", function (value) {
            return this.parent.password === value;
        }),
});

const SignupScreen = ({ navigation }: any) => {
    const [errorState, setErrorState] = useState("");
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? darkTheme : lightTheme;

    const handleSignup = async (values: {
        email: string;
        password: string;
        confirm: string;
    }) => {
        try {
            await createUserWithEmailAndPassword(
                auth,
                values.email,
                values.password
            );
            // navigate to main screen or login
        } catch (error: any) {
            setErrorState(error.message);
        }
    };

    return (
        <LinearGradient
            colors={["#a445b2", "#fa4299"]}
            style={styles.container}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={[
                    styles.formContainer,
                    { backgroundColor: theme.background },
                ]}
            >
                <Text style={[styles.header, { color: theme.text }]}>
                    Signup Form
                </Text>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={styles.tabInactive}
                        onPress={() => navigation.navigate("Login")}
                    >
                        <Text style={styles.tabTextInactive}>Login</Text>
                    </TouchableOpacity>
                    <LinearGradient
                        colors={["#a445b2", "#fa4299"]}
                        style={styles.tabActive}
                    >
                        <Text style={styles.tabTextActive}>Signup</Text>
                    </LinearGradient>
                </View>

                <Formik
                    initialValues={{ email: "", password: "", confirm: "" }}
                    validationSchema={SignupSchema}
                    onSubmit={handleSignup}
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
                                placeholder="Email Address"
                                placeholderTextColor={theme.placeholder}
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: theme.inputBg,
                                        color: theme.inputText,
                                    },
                                ]}
                                onChangeText={handleChange("email")}
                                onBlur={handleBlur("email")}
                                value={values.email}
                            />
                            {touched.email && errors.email && (
                                <Text style={styles.error}>{errors.email}</Text>
                            )}

                            <TextInput
                                placeholder="Password"
                                placeholderTextColor={theme.placeholder}
                                secureTextEntry
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: theme.inputBg,
                                        color: theme.inputText,
                                    },
                                ]}
                                onChangeText={handleChange("password")}
                                onBlur={handleBlur("password")}
                                value={values.password}
                            />
                            {touched.password && errors.password && (
                                <Text style={styles.error}>
                                    {errors.password}
                                </Text>
                            )}

                            <TextInput
                                placeholder="Confirm Password"
                                placeholderTextColor={theme.placeholder}
                                secureTextEntry
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: theme.inputBg,
                                        color: theme.inputText,
                                    },
                                ]}
                                onChangeText={handleChange("confirm")}
                                onBlur={handleBlur("confirm")}
                                value={values.confirm}
                            />
                            {touched.confirm && errors.confirm && (
                                <Text style={styles.error}>
                                    {errors.confirm}
                                </Text>
                            )}
                            {errorState !== "" && (
                                <Text style={styles.error}>{errorState}</Text>
                            )}

                            <TouchableOpacity onPress={() => handleSubmit()}>
                                <LinearGradient
                                    colors={["#a445b2", "#fa4299"]}
                                    style={styles.signupButton}
                                >
                                    <Text style={styles.signupText}>
                                        Signup
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <View style={styles.bottomText}>
                                <Text
                                    style={[
                                        styles.bottomPlain,
                                        { color: theme.text },
                                    ]}
                                >
                                    Already have an account?{" "}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate("Login")}
                                >
                                    <Text style={styles.signupNow}>Login</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </Formik>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const lightTheme = {
    background: "#fff",
    text: "#000",
    inputBg: "#f2f2f2",
    inputText: "#000",
    placeholder: "#888",
};

const darkTheme = {
    background: "#1e1e1e",
    text: "#fff",
    inputBg: "#2c2c2c",
    inputText: "#fff",
    placeholder: "#aaa",
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    formContainer: {
        width: "85%",
        padding: 24,
        borderRadius: 12,
        elevation: 10,
    },
    header: {
        fontSize: 26,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
    },
    tabContainer: {
        flexDirection: "row",
        marginBottom: 20,
        borderRadius: 8,
        overflow: "hidden",
    },
    tabActive: {
        flex: 1,
        padding: 12,
        alignItems: "center",
    },
    tabInactive: {
        flex: 1,
        padding: 12,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ddd",
        alignItems: "center",
    },
    tabTextActive: {
        color: "#fff",
        fontWeight: "600",
    },
    tabTextInactive: {
        color: "#333",
        fontWeight: "600",
    },
    input: {
        borderRadius: 6,
        padding: 12,
        marginBottom: 10,
    },
    signupButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 20,
    },
    signupText: {
        color: "#fff",
        fontWeight: "bold",
    },
    bottomText: {
        flexDirection: "row",
        justifyContent: "center",
    },
    bottomPlain: {
        color: "#333",
    },
    signupNow: {
        color: "#fa4299",
        fontWeight: "600",
    },
    error: {
        color: "red",
        fontSize: 12,
        marginBottom: 8,
    },
});

export default SignupScreen;
