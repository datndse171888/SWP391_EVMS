export const validEmail = (email: string): string => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
        return 'Sai định dạng email';
    }
    return '';
}

export const validPhoneNumber = (phoneNumber: string): string => {
    const phoneRegex = /^(09|03|05|07|08)\d{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
        return 'Số điện thoại phải bắt đầu bằng 09, 03, 05, 07 hoặc 08 và có 10 chữ số';
    } else if (phoneNumber.length !== 10) {
        return 'Số điện thoại phải có đúng 10 chữ số';
    }
    return '';
}

export const validPassword = (password: string): string => {
    if (password.length < 8) {
        return 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    return '';
}

export const validConfirmPassword = (password: string, confirmPassword: string): string => {
    if (password !== confirmPassword) {
        return 'Mật khẩu xác nhận không khớp';
    }
    return '';
}