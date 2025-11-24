import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { makeRequest } from "../services/fetchRequest";
import { getFormatoFecha } from "../utils/formatDate";
import { getData } from "../utils/LocalStorage";

export default function CommentsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [expandedComments, setExpandedComments] = useState({});
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [publicacionId, setPublicacionId] = useState(1);
  const [userId, setUserId] = useState(0);
  const [comments, setComments] = useState([]);
  const [repliesById, setRepliesById] = useState([]);
  const [moreById, setMoreById] = useState([]);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    (async () => {
      await getData('idUser', setUserId);
    })();

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  async function cargarComentarios() {
    setModalVisible(true)
    try {
      setComments([]);
      setRepliesById([]);
      setMoreById([]);
      setExpandedComments([]);
      const data = await makeRequest(`/comentarios/publicacion/27/0`);
      setComments(prev => [...data.data, ...prev]);
    } catch (e) {
      console.log(e);
    } finally {
    }
  }

  const toggleReplies = async (item) => {
    if (repliesById[item.comentarioId] == undefined) {
      repliesById[item.comentarioId] = [];
      await cargarRespuestas(item);
    }

    setExpandedComments((prev) => ({
      ...prev,
      [item.comentarioId]: !prev[item.comentarioId],
    }));

  };

  async function cargarRespuestas(item) {
    if (moreById[item.comentarioId] ?? true) {
      const data = await makeRequest(`/comentarios/respuestas/${item.comentarioId}/${repliesById[item.comentarioId].length / 20}`);

      setRepliesById(prev => ({
        ...prev,
        [item.comentarioId]: [...repliesById[item.comentarioId], ...data.data],
      }));

      setMoreById(prev => ({
        ...prev,
        [item.comentarioId]: data.data.length == 20,
      }));
    }
  }

  const handleReply = (comment) => {
    setReplyingTo(comment);
  };

  const handleSendComment = () => {
    if (commentText.trim()) {
      console.log("Enviando comentario:", commentText);
      if (replyingTo) {
        console.log("Respondiendo a:", replyingTo.user);
      }
      setCommentText("");
      setReplyingTo(null);
    }
  };

  const renderComment = ({ item, isReply = false }) => (
    <View style={[styles.commentContainer, isReply && styles.replyContainer]}>
      <Image source={{ uri: item.usuarioImagen }} style={styles.commentAvatar} />

      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUser}>{item.usuario}</Text>
          <Text style={styles.commentDate}>{getFormatoFecha(item.comentarioCreacion)}</Text>
        </View>

        <Text style={styles.commentText}>{item.comentarioTexto}</Text>

        {!isReply && (
          <View style={styles.commentActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleReply(item)}
            >
              <Text style={styles.actionText}>Responder</Text>
            </TouchableOpacity>

            {item.comentarioRespuestas > 0 && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => toggleReplies(item)}
              >
                <Text style={styles.actionText}>
                  {expandedComments[item.comentarioId]
                    ? "Ocultar respuestas"
                    : `Ver ${item.comentarioRespuestas} respuesta${item.comentarioRespuestas > 1 ? "s" : ""
                    }`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {!isReply &&
          expandedComments[item.comentarioId] &&
          (repliesById[item.comentarioId] ?? []) &&
          (repliesById[item.comentarioId] ?? []).length > 0 && (
            <View style={styles.repliesContainer}>
              {(repliesById[item.comentarioId] ?? []).map((reply) => (
                <View key={reply.id} style={styles.replyItem}>
                  <Image
                    source={{ uri: reply.usuarioImagen }}
                    style={styles.replyAvatar}
                  />
                  <View style={styles.replyContent}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentUser}>{reply.usuario}</Text>
                      <Text style={styles.commentDate}>{getFormatoFecha(reply.comentarioCreacion)}</Text>
                    </View>
                    <Text style={styles.commentText}>{reply.comentarioTexto}</Text>
                  </View>
                </View>
              ))}

              {(moreById[item.comentarioId] ?? false) && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => cargarRespuestas(item)}>
                  <Text style={styles.actionText}>Ver más respuestas</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Vista Home</Text>

      <TouchableOpacity
        style={styles.commentsButton}
        onPress={() => cargarComentarios()}
      >
        <Ionicons name="chatbubble-outline" size={20} color="#fff" />
        <Text style={styles.commentsButtonText}>Ver Comentarios</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={[
            styles.modalContent,
            keyboardHeight > 0 && { marginBottom: keyboardHeight }
          ]}>

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comentarios</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={comments}
              keyExtractor={(item) => item.comentarioId}
              renderItem={renderComment}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.commentsList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={48}
                    color="#ccc"
                  />
                  <Text style={styles.emptyText}>
                    Sé el primero en comentar
                  </Text>
                </View>
              }
            />


            <View style={styles.inputContainer}>
              {replyingTo && (
                <View style={styles.replyingToContainer}>
                  <Text style={styles.replyingToText}>
                    Respondiendo a {replyingTo.usuario}
                  </Text>
                  <TouchableOpacity onPress={() => setReplyingTo(null)}>
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.inputRow}>
                <Image
                  source={{ uri: "https://i.pravatar.cc/100?img=1" }}
                  style={styles.inputAvatar}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Escribe un comentario..."
                  placeholderTextColor="#999"
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    !commentText.trim() && styles.sendButtonDisabled,
                  ]}
                  onPress={handleSendComment}
                  disabled={!commentText.trim()}
                >
                  <Ionicons
                    name="send"
                    size={20}
                    color={commentText.trim() ? "#007AFF" : "#ccc"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAFA",
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
  commentsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  commentsButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "100%"
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  commentsList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  commentContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  replyContainer: {
    marginLeft: 40,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#F0F0F0",
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  commentUser: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  commentDate: {
    fontSize: 12,
    color: "#666",
  },
  commentText: {
    fontSize: 14,
    color: "#000",
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: "row",
    gap: 16,
  },
  actionButton: {
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
  },
  repliesContainer: {
    marginTop: 12,
    gap: 12,
  },
  replyItem: {
    flexDirection: "row",
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: "#F0F0F0",
  },
  replyContent: {
    flex: 1,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#fff",
    paddingBottom: Platform.OS === "ios" ? 20 : 8,
  },
  replyingToContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F8F8F8",
  },
  replyingToText: {
    fontSize: 13,
    color: "#666",
    fontStyle: "italic",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  inputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F0F0",
  },
  input: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "#999",
    textAlign: "center",
    marginTop: 12,
    fontSize: 15,
  },
});
