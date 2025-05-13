import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    Image,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useTheme } from "../context/ThemeContext";
import { getDatabase, ref, onValue, remove } from "firebase/database";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

// Add this interface before the HomeScreen component
interface RouteParams {
    deleteService?: {
        serviceId: string;
        userId: string;
    };
}

const HomeScreen = () => {
    const [userData, setUserData] = useState({
        fullName: "",
        age: "",
        gender: "",
        avatarUrl: "",
    });

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    const { isDarkMode, toggleTheme, theme } = useTheme();
    const [language, setLanguage] = useState("vi");
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();

    const toggleLanguage = () =>
        setLanguage((prev) => (prev === "vi" ? "en" : "vi"));

    const translations = {
        vi: {
            fullName: "Họ tên",
            age: "Tuổi",
            gender: "Giới tính",
            save: "Lưu thông tin",
            logout: "Đăng xuất",
            changeAvatar: "📸 Đổi ảnh",
            male: "Nam",
            female: "Nữ",
            services: "Dịch vụ của tôi",
            addService: "Thêm dịch vụ mới",
            noServices: "Bạn chưa có dịch vụ nào. Hãy thêm dịch vụ mới!",
            price: "Giá:",
        },
        en: {
            fullName: "Full Name",
            age: "Age",
            gender: "Gender",
            save: "Save Information",
            logout: "Logout",
            changeAvatar: "📸 Change Avatar",
            male: "Male",
            female: "Female",
            services: "My Services",
            addService: "Add New Service",
            noServices: "You don't have any services yet. Add a new service!",
            price: "Price:",
        },
    };

    const t = translations[language];

    // Handle delete service request from ServiceDetailScreen
    useEffect(() => {
        if (route.params?.deleteService) {
            const { serviceId, userId } = route.params.deleteService;
            handleDeleteService(serviceId);
            // Clear params to prevent repeated deletions
            navigation.setParams({ deleteService: null } as any);
        }
    }, [route.params?.deleteService]);

    const handleDeleteService = async (serviceId) => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const db = getDatabase();
            const serviceRef = ref(db, `services/${user.uid}/${serviceId}`);

            await remove(serviceRef);
            Alert.alert("Success", "Service deleted successfully");
        } catch (error) {
            console.error("Delete error:", error);
            Alert.alert("Error", "Failed to delete service");
        }
    };

    // Load services from Firebase
    useEffect(() => {
        const loadServices = async () => {
            const user = auth.currentUser;
            if (!user) return;

            try {
                const db = getDatabase();
                const servicesRef = ref(db, `services/${user.uid}`);

                onValue(servicesRef, (snapshot) => {
                    const data = snapshot.val();
                    const servicesList = [];

                    if (data) {
                        Object.keys(data).forEach((key) => {
                            servicesList.push({
                                id: key,
                                ...data[key],
                            });
                        });
                    }

                    setServices(servicesList);
                    setLoading(false);
                });
            } catch (error) {
                console.error("Load services error:", error);
                setLoading(false);
            }
        };

        loadServices();
    }, []);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                const uri = result.assets[0].uri;
                const fileName = uri.split("/").pop();
                const localUri = FileSystem.documentDirectory + fileName;

                await FileSystem.copyAsync({ from: uri, to: localUri });
                setUserData((prev) => ({ ...prev, avatarUrl: localUri }));
                await AsyncStorage.setItem("avatarUri", localUri);

                const user = auth.currentUser;
                if (user) {
                    const userRef = doc(db, "users", user.uid);
                    await setDoc(
                        userRef,
                        { avatarUrl: localUri },
                        { merge: true }
                    );
                }
            }
        } catch (err) {
            console.error("Image picking failed:", err);
            Alert.alert("Lỗi", "Không thể chọn ảnh. Vui lòng thử lại!");
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (err) {
            Alert.alert("Lỗi", "Không thể đăng xuất!");
        }
    };

    const handleSave = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;
            // tuổi k quá lớn hơn 150
            if (!userData.age || parseInt(userData.age, 10) > 150) {
                Alert.alert("Lỗi", "Tuổi không hợp lệ! Vui lòng kiểm tra lại.");
                return;
            }

            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, {
                fullName: userData.fullName,
                age: userData.age,
                gender: userData.gender,
                avatarUrl: userData.avatarUrl,
            });

            Alert.alert("✅ Đã lưu thông tin thành công!");
        } catch (err) {
            console.error("Save error:", err);
            Alert.alert("❌ Lỗi khi lưu thông tin!");
        }
    };

    useEffect(() => {
        const loadUserData = async () => {
            const user = auth.currentUser;
            if (!user) return;

            try {
                const userRef = doc(db, "users", user.uid);
                const snap = await getDoc(userRef);

                if (snap.exists()) {
                    const data = snap.data();
                    setUserData({
                        fullName: data.fullName || "",
                        age: data.age || "",
                        gender: data.gender || "",
                        avatarUrl: data.avatarUrl || "",
                    });
                }
            } catch (error) {
                // console.error("Load user data failed:", error);
            }
        };
        loadUserData();
    }, []);

    const renderServiceItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.serviceCard,
                { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            onPress={() =>
                navigation.navigate(
                    "ServiceDetail" as never,
                    {
                        serviceId: item.id,
                        userId: auth.currentUser?.uid,
                    } as never
                )
            }
        >
            <Text style={[styles.serviceName, { color: theme.text }]}>
                {item.name}
            </Text>
            <Text
                style={[styles.serviceDesc, { color: theme.text }]}
                numberOfLines={2}
            >
                {item.desc}
            </Text>
            <Text style={[styles.servicePrice, { color: theme.text }]}>
                {t.price} ${item.price}
            </Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView
            contentContainerStyle={[
                styles.container,
                { backgroundColor: theme.background },
            ]}
        >
            <Image
                source={
                    userData.avatarUrl
                        ? { uri: userData.avatarUrl }
                        : require("../assets/avatar-placeholder.png")
                }
                style={styles.avatar}
            />
            <TouchableOpacity onPress={pickImage}>
                <Text style={[styles.pickText, { color: theme.text }]}>
                    {t.changeAvatar}
                </Text>
            </TouchableOpacity>
            <View style={styles.toggleRow}>
                <TouchableOpacity
                    onPress={toggleLanguage}
                    style={styles.toggleButton}
                >
                    <Text style={[styles.toggleText, { color: theme.text }]}>
                        {language.toUpperCase()}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={toggleTheme}
                    style={styles.toggleButton}
                >
                    <Text style={[styles.toggleText, { color: theme.text }]}>
                        {isDarkMode ? "🌙" : "☀️"}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>
                    {t.fullName}
                </Text>
                <TextInput
                    placeholder={t.fullName}
                    placeholderTextColor={theme.placeholder}
                    value={userData.fullName}
                    onChangeText={(text) =>
                        setUserData({ ...userData, fullName: text })
                    }
                    style={[
                        styles.input,
                        {
                            backgroundColor: theme.inputBg,
                            color: theme.inputText,
                            borderColor: theme.border,
                        },
                    ]}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>
                    Email
                </Text>
                <TextInput
                    value={auth.currentUser?.email || "Không có email"}
                    editable={false}
                    style={[
                        styles.readOnlyInput,
                        {
                            backgroundColor: theme.inputBg,
                            color: theme.inputText,
                            borderColor: theme.border,
                        },
                    ]}
                    placeholderTextColor={theme.placeholder}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>
                    {t.age}
                </Text>
                <TextInput
                    placeholder={t.age}
                    placeholderTextColor={theme.placeholder}
                    keyboardType="numeric"
                    value={userData.age}
                    onChangeText={(text) => {
                        const age = parseInt(text, 10);
                        if (isNaN(age) || age > 150) {
                            setUserData((prev) => ({ ...prev, age: "" }));
                            Alert.alert("Lỗi", "Tuổi không được quá lớn!");
                        } else {
                            setUserData((prev) => ({ ...prev, age: text }));
                        }
                    }}
                    style={[
                        styles.input,
                        {
                            backgroundColor: theme.inputBg,
                            color: theme.inputText,
                            borderColor: theme.border,
                        },
                    ]}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>
                    {t.gender}
                </Text>
                <View style={styles.genderRow}>
                    {["Nam", "Nữ"].map((g) => (
                        <TouchableOpacity
                            key={g}
                            style={[
                                styles.genderButton,
                                userData.gender === g && styles.genderSelected,
                            ]}
                            onPress={() =>
                                setUserData({ ...userData, gender: g })
                            }
                        >
                            <Text
                                style={[
                                    styles.genderText,
                                    userData.gender === g &&
                                        styles.genderSelectedText,
                                ]}
                            >
                                {t[g === "Nam" ? "male" : "female"]}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <TouchableOpacity onPress={handleSave}>
                <LinearGradient
                    colors={theme.button as any}
                    style={styles.saveButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Text style={styles.saveButtonText}>{t.save}</Text>
                </LinearGradient>
            </TouchableOpacity>

            {/* Services Section */}
            <View style={styles.servicesSection}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    {t.services}
                </Text>

                <TouchableOpacity
                    onPress={() => navigation.navigate("AddService" as never)}
                    style={styles.addServiceButton}
                >
                    <LinearGradient
                        colors={theme.button as any}
                        style={styles.gradientButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text
                            style={{
                                color: theme.buttonText,
                                fontWeight: "bold",
                            }}
                        >
                            {t.addService}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>

                {services.length === 0 ? (
                    <View style={styles.emptyServices}>
                        <Text style={{ color: theme.text }}>
                            {t.noServices}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={services}
                        renderItem={renderServiceItem}
                        keyExtractor={(item) => item.id}
                        style={styles.servicesList}
                        scrollEnabled={false}
                    />
                )}
            </View>

            <TouchableOpacity
                onPress={handleLogout}
                style={[styles.logoutButton, { borderColor: theme.border }]}
            >
                <Text style={[styles.logoutText, { color: theme.text }]}>
                    {t.logout}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        gap: 12,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: "center",
        marginBottom: 16,
    },
    pickText: {
        textAlign: "center",
        marginBottom: 16,
        fontSize: 16,
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        marginBottom: 6,
        fontSize: 15,
        fontWeight: "500",
    },
    input: {
        borderWidth: 1,
        padding: 10,
        borderRadius: 8,
        fontSize: 15,
    },
    readOnlyInput: {
        borderWidth: 1,
        padding: 10,
        borderRadius: 8,
        fontSize: 15,
    },
    genderRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 8,
    },
    genderButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "#f0f0f0",
    },
    genderSelected: {
        backgroundColor: "#007BFF",
        borderColor: "#007BFF",
    },
    genderText: {
        fontSize: 14,
        color: "#333",
    },
    genderSelectedText: {
        color: "#fff",
        fontWeight: "bold",
    },
    button: {
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 12,
    },
    buttonText: {
        fontWeight: "600",
        fontSize: 16,
    },
    toggleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
        alignItems: "center",
    },
    toggleButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "theme.border", // tự động đổi theo theme
        backgroundColor: "theme.inputBg", // phù hợp với light & dark
    },
    toggleText: {
        fontSize: 14,
        fontWeight: "500",
        //color: theme.text, // đảm bảo luôn đọc được
    },
    servicesSection: {
        marginTop: 30,
        width: "100%",
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
    },
    addServiceButton: {
        marginBottom: 15,
    },
    gradientButton: {
        height: 50,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyServices: {
        padding: 20,
        alignItems: "center",
    },
    servicesList: {
        width: "100%",
    },
    serviceCard: {
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
    },
    serviceName: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    serviceDesc: {
        marginBottom: 10,
    },
    servicePrice: {
        fontWeight: "bold",
    },
    saveButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 12,
    },
    saveButtonText: {
        fontWeight: "600",
        fontSize: 16,
    },
    logoutButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 12,
    },
    logoutText: {
        fontWeight: "600",
        fontSize: 16,
    },
});

export default HomeScreen;
