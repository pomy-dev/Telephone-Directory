import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions
} from "react-native";
import { Avatar } from "react-native-paper";
import { AuthContext } from "../../context/authProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppContext } from "../../context/appContext";
import { Icons } from "../../constants/Icons";
import { Images } from "../../constants/Images";

const { width, height } = Dimensions.get("window");

const AssociatedSchoolScreen = ({ route, navigation }) => {
  const { theme, isDarkMode } = React.useContext(AppContext);
  const { user } = React.useContext(AuthContext);

  const school = {
    id: "school-001",

    name: "Vocational Centre",

    logo: Images.gwamile,

    motto: "Skills for a Better Future",

    location: {
      address: "Manzini, Eswatini",
    },

    mission:
      "To provide practical, accessible and industry-relevant skills that empower students for employment and entrepreneurship.",

    student: {
      fullName: "Sibusiso Dlamini",
      studentNumber: "ESDC-2024-014",
      age: 22,

      courses: [
        "Motor Vehicle Repair",
        "Welding and Fabrication",
      ],

      yearAdmitted: 2024,
      yearCompleted: 2026,
    },

    courses: [
      {
        id: "course-1",
        name: "Motor Vehicle Repair",
        image: Images.machenic,
        description:
          "Practical training in vehicle maintenance, diagnostics and mechanical repair.",
      },
      {
        id: "course-2",
        name: "Welding and Fabrication",
        image: Images.wood,
        description:
          "Training in welding techniques, metal fabrication and workshop safety.",
      },
      {
        id: "course-3",
        name: "Sewing and Fabric Design",
        image: Images.textile,
        description:
          "Practical training in garment construction, sewing and fabric design.",
      },
    ],
  };
  // const school = route.params?.school;

  // useEffect(() => { }, []);

  if (!school) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={{ padding: 16, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icons.Ionicons name="arrow-back" color={theme.colors.text} size={24} />
          </TouchableOpacity>
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '200' }}>Associated School</Text>
          {user.photoURL
            ? <Avatar.Image source={{ uri: user.photoURL }} size={30} />
            : <Avatar.Icon size={30} icon="account" color={'#fff'} />
          }
        </View>

        <View style={styles.emptyState}>
          <Icons.Ionicons
            name="school-outline"
            size={56}
            color={theme.colors.sub_text}
          />

          <Text
            style={[
              styles.emptyText,
              { color: theme.colors.sub_text },
            ]}
          >
            School information unavailable
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const student = school.student || school.associated_student;

  const studentInitials = getInitials(
    student?.fullName ||
    student?.name ||
    school.studentName ||
    "Student",
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["top"]} >
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />

      {/* APP BAR */}
      <View style={{ padding: 16, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons.Ionicons name="arrow-back" color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600' }}>Associated School</Text>
        {user.photoURL
          ? <Avatar.Image source={{ uri: user.photoURL }} size={30} />
          : <Avatar.Icon size={30} icon="account" color={'#fff'} />
        }
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} >
        {/* ───────────────── SCHOOL BANNER ───────────────── */}
        <View
          style={[
            styles.schoolBanner,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <View
            style={[
              styles.schoolLogo,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
              },
            ]}
          >
            {school.logo ? (
              <Image
                source={school.logo}
                style={styles.schoolLogoImage}
              />
            ) : (
              <Text
                style={[
                  styles.schoolLogoInitial,
                  { color: theme.colors.text },
                ]}
              >
                {getInitials(school.name)}
              </Text>
            )}
          </View>

          <Text
            style={[
              styles.schoolName,
              { color: theme.colors.text },
            ]}
          >
            {school.name}
          </Text>

          {!!school.motto && (
            <Text
              style={[
                styles.schoolMotto,
                { color: theme.colors.sub_text },
              ]}
            >
              "{school.motto}"
            </Text>
          )}

          {!!school.location && (
            <View style={styles.locationRow}>
              <Icons.Ionicons
                name="location-sharp"
                size={14}
                color={theme.colors.indicator}
              />

              <Text
                style={[
                  styles.locationText,
                  { color: theme.colors.sub_text },
                ]}
              >
                {typeof school.location === "object"
                  ? school.location?.address
                  : school.location}
              </Text>
            </View>
          )}
        </View>

        {/* ───────────────── STUDENT ───────────────── */}
        {student && (
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.sub_text },
              ]}
            >
              STUDENT
            </Text>

            <View
              style={[
                styles.studentCard,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <View style={styles.studentHeader}>
                <View
                  style={[
                    styles.studentAvatar,
                    {
                      backgroundColor:
                        theme.colors.card2,
                    },
                  ]}
                >
                  <Text style={styles.studentAvatarText}>
                    {studentInitials}
                  </Text>
                </View>

                <View style={styles.studentIdentity}>
                  <Text
                    style={[
                      styles.studentName,
                      { color: theme.colors.text },
                    ]}
                    numberOfLines={1}
                  >
                    {student.fullName ||
                      student.name ||
                      school.studentName}
                  </Text>

                  {!!student.studentNumber && (
                    <Text
                      style={[
                        styles.studentMeta,
                        { color: theme.colors.sub_text },
                      ]}
                    >
                      Student No: {student.studentNumber}
                    </Text>
                  )}

                  {!!student.age && (
                    <Text
                      style={[
                        styles.studentMeta,
                        { color: theme.colors.sub_text },
                      ]}
                    >
                      Age: {student.age}
                    </Text>
                  )}
                </View>
              </View>

              {/* COURSES */}
              {student.courses?.length > 0 && (
                <View style={styles.studentDetail}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: theme.colors.sub_text },
                    ]}
                  >
                    COURSES
                  </Text>

                  <View style={styles.courseList}>
                    {student.courses.map((course, index) => (
                      <View
                        key={`${course}-${index}`}
                        style={styles.courseBulletRow}
                      >
                        <View
                          style={[
                            styles.courseBullet,
                            {
                              backgroundColor:
                                theme.colors.primary,
                            },
                          ]}
                        />

                        <Text
                          style={[
                            styles.courseBulletText,
                            { color: theme.colors.text },
                          ]}
                        >
                          {typeof course === "string"
                            ? course
                            : course.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* DATES */}
              <View style={styles.studentDates}>
                <View style={styles.dateItem}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: theme.colors.sub_text },
                    ]}
                  >
                    YEAR ADMITTED
                  </Text>

                  <Text
                    style={[
                      styles.dateValue,
                      { color: theme.colors.text },
                    ]}
                  >
                    {student.yearAdmitted || "—"}
                  </Text>
                </View>

                <View style={styles.dateItem}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: theme.colors.sub_text },
                    ]}
                  >
                    YEAR COMPLETED
                  </Text>

                  <Text
                    style={[
                      styles.dateValue,
                      { color: theme.colors.text },
                    ]}
                  >
                    {student.yearCompleted || "—"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ───────────────── MISSION ───────────────── */}
        {!!school.mission && (
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.sub_text },
              ]}
            >
              MISSION STATEMENT
            </Text>

            <View
              style={[
                styles.contentCard,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <View
                style={[
                  styles.missionIcon,
                  {
                    backgroundColor:
                      theme.colors.card2,
                  },
                ]}
              >
                <Icons.Ionicons
                  name="star-outline"
                  size={20}
                  color="#fff"
                />
              </View>

              <Text
                style={[
                  styles.missionText,
                  { color: theme.colors.text },
                ]}
              >
                {school.mission}
              </Text>
            </View>
          </View>
        )}

        {/* ───────────────── COURSES ───────────────── */}
        {school.courses?.length > 0 && (
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.sub_text },
              ]}
            >
              COURSES OFFERED
            </Text>

            {school.courses.map((course, index) => (
              <React.Fragment
                key={course.id || `${course.name}-${index}`}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.courseListItem}
                  onPress={() => {
                    // Optional: navigate to course details later
                    // navigation.navigate("CourseDetails", { course });
                  }}
                >
                  {/* START ICON */}
                  <View
                    style={[
                      styles.courseStartIcon,
                      {
                        backgroundColor: theme.colors.card2,
                      },
                    ]}
                  >
                    <Icons.Ionicons
                      name="school-outline"
                      size={19}
                      color="#fff"
                    />
                  </View>

                  {/* COURSE NAME + DESCRIPTION */}
                  <View style={styles.courseListInfo}>
                    <Text
                      style={[
                        styles.courseListName,
                        { color: theme.colors.text },
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {course.name}
                    </Text>

                    <Text
                      style={[
                        styles.courseListDescription,
                        { color: theme.colors.sub_text },
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {course.description || "No description available."}
                    </Text>
                  </View>

                  {/* COURSE IMAGE */}
                  <View style={styles.courseListImageWrapper}>
                    {course.image ? (
                      <Image
                        source={course.image}
                        style={styles.courseListImage}
                      />
                    ) : (
                      <View
                        style={[
                          styles.courseListImagePlaceholder,
                          {
                            backgroundColor: theme.colors.card2,
                          },
                        ]}
                      >
                        <Icons.Ionicons
                          name="image-outline"
                          size={20}
                          color="#fff"
                        />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>

                {/* DIVIDER */}
                {index < school.courses.length - 1 && (
                  <View
                    style={[
                      styles.courseListDivider,
                      { backgroundColor: theme.colors.border },
                    ]}
                  />
                )}
              </React.Fragment>
            ))}
          </View>
        )}

        <View style={{ height: height * 0.1 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const getInitials = (name = "") => {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  emptyText: {
    fontSize: 15,
    fontWeight: "600",
  },

  /* SCHOOL BANNER */

  schoolBanner: {
    marginTop: 14,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",
  },

  schoolLogo: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  schoolLogoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  schoolLogoInitial: {
    fontSize: 30,
    fontWeight: "800",
  },

  schoolName: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },

  schoolMotto: {
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 5,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 10,
  },

  locationText: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    flexShrink: 1,
  },

  /* ── COURSES LIST ── */

  coursesListCard: {
    borderRadius: 16,
    overflow: "hidden",
  },

  courseListItem: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    // paddingHorizontal: 14,
    paddingVertical: 10,
  },

  courseStartIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  courseListInfo: {
    flex: 1,
    justifyContent: "center",
    marginRight: 12,
  },

  courseListName: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },

  courseListDescription: {
    fontSize: 12,
    lineHeight: 17,
  },

  courseListImageWrapper: {
    width: 58,
    height: 58,
    borderRadius: 10,
    overflow: "hidden",
  },

  courseListImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  courseListImagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  courseListDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 68,
  },

  /* SECTIONS */

  section: {
    marginTop: 24,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 8,
  },

  /* STUDENT */
  studentCard: {
    borderRadius: 16,
    padding: 18,
  },

  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  studentAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },

  studentAvatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },

  studentIdentity: {
    flex: 1,
    marginLeft: 12,
  },

  studentName: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },

  studentMeta: {
    fontSize: 12,
    marginTop: 2,
  },

  studentDetail: {
    marginTop: 20,
  },

  detailLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.7,
    marginBottom: 7,
  },

  courseList: {
    gap: 7,
  },

  courseBulletRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  courseBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 9,
  },

  courseBulletText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },

  studentDates: {
    flexDirection: "row",
    marginTop: 20,
    gap: 24,
  },

  dateItem: {
    flex: 1,
  },

  dateValue: {
    fontSize: 14,
    fontWeight: "700",
  },

  /* MISSION */

  contentCard: {
    borderRadius: 16,
    padding: 18,
  },

  missionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  missionText: {
    fontSize: 14,
    lineHeight: 22,
  },

  /* COURSES */

  courseCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },

  courseImage: {
    width: "100%",
    height: 170,
    resizeMode: "cover",
  },

  courseImagePlaceholder: {
    width: "100%",
    height: 170,
    alignItems: "center",
    justifyContent: "center",
  },

  courseInfo: {
    padding: 16,
  },

  courseName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },

  courseDescription: {
    fontSize: 13,
    lineHeight: 20,
  },
});

export default AssociatedSchoolScreen;