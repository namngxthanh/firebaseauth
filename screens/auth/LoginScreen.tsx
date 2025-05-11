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
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";

const LoginSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string().required("Required"),
});

const LoginScreen = ({ navigation }: any) => {
    const [errorState, setErrorState] = useState("");

    const handleLogin = async (values: { email: string; password: string }) => {
        try {
            await signInWithEmailAndPassword(
                auth,
                values.email,
                values.password
            );
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
                style={styles.formContainer}
            >
                <Text style={styles.header}>Login Form</Text>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <LinearGradient
                        colors={["#a445b2", "#fa4299"]}
                        style={styles.tabActive}
                    >
                        <Text style={styles.tabTextActive}>Login</Text>
                    </LinearGradient>
                    <TouchableOpacity
                        style={styles.tabInactive}
                        onPress={() => navigation.navigate("Signup")}
                    >
                        <Text style={styles.tabTextInactive}>Signup</Text>
                    </TouchableOpacity>
                </View>

                <Formik
                    initialValues={{ email: "", password: "" }}
                    validationSchema={LoginSchema}
                    onSubmit={handleLogin}
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
                                placeholderTextColor="#999"
                                style={styles.input}
                                onChangeText={handleChange("email")}
                                onBlur={handleBlur("email")}
                                value={values.email}
                            />
                            {touched.email && errors.email && (
                                <Text style={styles.error}>{errors.email}</Text>
                            )}

                            <TextInput
                                placeholder="Password"
                                placeholderTextColor="#999"
                                secureTextEntry={true}
                                style={styles.input}
                                onChangeText={handleChange("password")}
                                onBlur={handleBlur("password")}
                                value={values.password}
                            />
                            {touched.password && errors.password && (
                                <Text style={styles.error}>
                                    {errors.password}
                                </Text>
                            )}
                            {errorState !== "" && (
                                <Text style={styles.error}>{errorState}</Text>
                            )}

                            <TouchableOpacity>
                                <Text style={styles.forgot}>
                                    Forgot password?
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => handleSubmit()}>
                                <LinearGradient
                                    colors={["#a445b2", "#fa4299"]}
                                    style={styles.loginButton}
                                >
                                    <Text style={styles.loginText}>Login</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <View style={styles.bottomText}>
                                <Text style={styles.bottomPlain}>
                                    Not a member?{" "}
                                </Text>
                                <TouchableOpacity
                                    onPress={() =>
                                        navigation.navigate("Signup")
                                    }
                                >
                                    <Text style={styles.signupNow}>
                                        Signup now
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </Formik>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
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
        backgroundColor: "#fff",
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
        backgroundColor: "#f2f2f2",
        borderRadius: 6,
        padding: 12,
        marginBottom: 10,
    },
    forgot: {
        color: "#fa4299",
        textAlign: "left",
        marginBottom: 20,
    },
    loginButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 20,
    },
    loginText: {
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

export default LoginScreen;
