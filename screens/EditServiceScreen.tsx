import React, { useState } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
    TextInput,
    Text,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { getDatabase, ref, update } from "firebase/database";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";

type EditServiceParams = {
    serviceId: string;
    userId: string;
    service: {
        name: string;
        desc: string;
        price: number;
    };
};

const EditServiceSchema = Yup.object().shape({
    serviceName: Yup.string().required("Service name is required"),
    description: Yup.string().required("Description is required"),
    price: Yup.number()
        .required("Price is required")
        .positive("Price must be positive")
        .typeError("Price must be a number"),
});

const EditServiceScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const { serviceId, userId, service } = route.params as EditServiceParams;
    const [loading, setLoading] = useState(false);

    const handleUpdateService = async (values: any) => {
        setLoading(true);
        try {
            const db = getDatabase();
            const serviceRef = ref(db, `services/${userId}/${serviceId}`);

            await update(serviceRef, {
                name: values.serviceName,
                desc: values.description,
                price: parseFloat(values.price),
            });

            Alert.alert("Success", "Service updated successfully", [
                { text: "OK", onPress: () => navigation.goBack() },
            ]);
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to update service");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <Text style={[styles.title, { color: theme.text }]}>
                Edit Service
            </Text>

            <Formik
                initialValues={{
                    serviceName: service.name,
                    description: service.desc,
                    price: service.price.toString(),
                }}
                validationSchema={EditServiceSchema}
                onSubmit={handleUpdateService}
            >
                {({
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    values,
                    errors,
                    touched,
                }) => (
                    <View style={styles.form}>
                        <Text
                            style={[styles.inputLabel, { color: theme.text }]}
                        >
                            Service Name
                        </Text>
                        <TextInput
                            placeholder="Service Name"
                            placeholderTextColor={theme.placeholder}
                            value={values.serviceName}
                            onChangeText={handleChange("serviceName")}
                            onBlur={handleBlur("serviceName")}
                            style={[
                                styles.input,
                                {
                                    backgroundColor: theme.inputBg,
                                    color: theme.inputText,
                                    borderColor: theme.border,
                                },
                            ]}
                        />
                        {touched.serviceName && errors.serviceName && (
                            <Text style={styles.errorText}>
                                {String(errors.serviceName)}
                            </Text>
                        )}

                        <Text
                            style={[styles.inputLabel, { color: theme.text }]}
                        >
                            Description
                        </Text>
                        <TextInput
                            placeholder="Description"
                            placeholderTextColor={theme.placeholder}
                            value={values.description}
                            onChangeText={handleChange("description")}
                            onBlur={handleBlur("description")}
                            style={[
                                styles.input,
                                styles.textArea,
                                {
                                    backgroundColor: theme.inputBg,
                                    color: theme.inputText,
                                    borderColor: theme.border,
                                    textAlignVertical: "top",
                                },
                            ]}
                            multiline
                            numberOfLines={4}
                        />
                        {touched.description && errors.description && (
                            <Text style={styles.errorText}>
                                {String(errors.description)}
                            </Text>
                        )}

                        <Text
                            style={[styles.inputLabel, { color: theme.text }]}
                        >
                            Price ($)
                        </Text>
                        <TextInput
                            placeholder="Price"
                            placeholderTextColor={theme.placeholder}
                            value={values.price}
                            onChangeText={handleChange("price")}
                            onBlur={handleBlur("price")}
                            style={[
                                styles.input,
                                {
                                    backgroundColor: theme.inputBg,
                                    color: theme.inputText,
                                    borderColor: theme.border,
                                },
                            ]}
                            keyboardType="numeric"
                        />
                        {touched.price && errors.price && (
                            <Text style={styles.errorText}>
                                {String(errors.price)}
                            </Text>
                        )}

                        <View style={styles.buttonsContainer}>
                            <TouchableOpacity
                                onPress={() => handleSubmit()}
                                disabled={loading}
                            >
                                <LinearGradient
                                    colors={theme.button as any}
                                    style={styles.gradientButton}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Text
                                        style={[
                                            styles.buttonText,
                                            { color: theme.buttonText },
                                        ]}
                                    >
                                        {loading
                                            ? "Updating..."
                                            : "Update Service"}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={[
                                    styles.cancelButton,
                                    { borderColor: theme.border },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.cancelButtonText,
                                        { color: theme.text },
                                    ]}
                                >
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </Formik>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    form: {
        width: "100%",
    },
    inputLabel: {
        fontSize: 16,
        marginBottom: 8,
    },
    input: {
        height: 50,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginBottom: 15,
        borderWidth: 1,
    },
    textArea: {
        height: 120,
        paddingTop: 12,
    },
    errorText: {
        color: "#fa4299",
        fontSize: 12,
        marginTop: -10,
        marginBottom: 10,
        marginLeft: 5,
    },
    buttonsContainer: {
        marginTop: 20,
    },
    gradientButton: {
        height: 50,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    cancelButton: {
        height: 50,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        borderWidth: 1,
    },
    cancelButtonText: {
        fontSize: 16,
    },
});

export default EditServiceScreen;
