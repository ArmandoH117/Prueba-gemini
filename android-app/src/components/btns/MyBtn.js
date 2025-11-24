import {
    StyleSheet,
    TouchableOpacity
} from 'react-native';

const MyBtn = ({ children, valores }) => {
    return (
        <TouchableOpacity
            style={styles.btn}
            onPress={valores}>
            {
                children
            }
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    btn:{
        backgroundColor: '#00ff88',
        borderWidth: 1,
        width: 150,
        height: 35,
        marginTop: 15,
        borderColor: 'green',
        borderRadius: 10,
        justifyContent: 'center',
    }
})

export default MyBtn;