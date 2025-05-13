import React, { useEffect, useState } from "react";
import {
    View,
    StyleSheet,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
} from "react-native";
import { getDatabase, ref, get } from "firebase/database";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";

type ServiceDetailParams = {
    serviceId: string;
    userId: string;
};

type Service = {
    name: string;
    desc: string;
    price: number;
};

const ServiceDetailScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { serviceId, userId } = route.params as ServiceDetailParams;

    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServiceDetails = async () => {
            try {
                const db = getDatabase();
                const serviceRef = ref(db, `services/${userId}/${serviceId}`);
                const snapshot = await get(serviceRef);

                if (snapshot.exists()) {
                    setService(snapshot.val());
                } else {
                    Alert.alert("Error", "Service not found");
                    navigation.goBack();
                }
            } catch (error: any) {
                Alert.alert(
                    "Error",
                    error.message || "Failed to load service details"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchServiceDetails();
    }, [serviceId, userId]);

    const handleDelete = () => {
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this service?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        navigation.navigate(
                            "Home" as never,
                            {
                                screen: "Home",
                                params: {
                                    deleteService: { serviceId, userId },
                                },
                            } as never
                        );
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View
                style={[
                    styles.container,
                    styles.centered,
                    { backgroundColor: theme.background },
                ]}
            >
                <Text style={{ color: theme.text }}>
                    Loading service details...
                </Text>
            </View>
        );
    }

    if (!service) {
        return (
            <View
                style={[
                    styles.container,
                    styles.centered,
                    { backgroundColor: theme.background },
                ]}
            >
                <Text style={{ color: theme.text }}>Service not found</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <LinearGradient
                        colors={theme.button as any}
                        style={styles.gradientButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={{ color: theme.buttonText }}>Go Back</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <View
                style={[
                    styles.card,
                    {
                        backgroundColor: theme.cardBg,
                        borderColor: theme.border,
                    },
                ]}
            >
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                    Service Details
                </Text>

                <View style={styles.detailRow}>
                    <Text style={[styles.label, { color: theme.text }]}>
                        Name:
                    </Text>
                    <Text style={[styles.value, { color: theme.text }]}>
                        {service.name}
                    </Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={[styles.label, { color: theme.text }]}>
                        Description:
                    </Text>
                    <Text style={[styles.value, { color: theme.text }]}>
                        {service.desc}
                    </Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={[styles.label, { color: theme.text }]}>
                        Price:
                    </Text>
                    <Text style={[styles.value, { color: theme.text }]}>
                        ${service.price}
                    </Text>
                </View>
            </View>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    onPress={() =>
                        navigation.navigate(
                            "EditService" as never,
                            {
                                serviceId,
                                userId,
                                service,
                            } as never
                        )
                    }
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
                            Edit Service
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleDelete}
                    style={[styles.deleteButton, { borderColor: "#fa4299" }]}
                >
                    <Text style={{ color: "#fa4299", fontWeight: "bold" }}>
                        Delete Service
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[
                        styles.outlineButton,
                        { borderColor: theme.border },
                    ]}
                >
                    <Text style={{ color: theme.text }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    centered: {
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        borderRadius: 10,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    detailRow: {
        marginBottom: 15,
    },
    label: {
        fontWeight: "bold",
        fontSize: 16,
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
    },
    buttonsContainer: {
        marginTop: 10,
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
    deleteButton: {
        height: 50,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
        borderWidth: 1,
    },
    outlineButton: {
        height: 50,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
        borderWidth: 1,
    },
});

export default ServiceDetailScreen;
