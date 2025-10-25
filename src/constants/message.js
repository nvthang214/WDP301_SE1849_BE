export const MESSAGE = {
  // THÔNG BÁO HỆ THỐNG
  SYSTEM_ERROR: "Lỗi máy chủ",
  NOT_FOUND: "Không tìm thấy tài nguyên",
  DUPLICATE_DATA: "Dữ liệu đã tồn tại",
  VALIDATION_ERROR: "Dữ liệu không hợp lệ",
  JWT_INVALID: "Token không hợp lệ",
  JWT_EXPIRED: "Token đã hết hạn",
  FORBIDDEN: "Không có quyền truy cập",
  UNAUTHORIZED: "Chưa được xác thực",
  LOGIN_EXPIRED: "Phiên đăng nhập hết hạn",
  REFRESH_TOKEN_SUCCESS: "Làm mới token thành công",
  SEND_MAIL_ERROR: "Lỗi gửi email, vui lòng thử lại sau",
  GG_TOKEN_INVALID: "Token Google không hợp lệ",

  // THÔNG BÁO VALIDATION
  FIELD_REQUIRED: "Vui lòng điền đầy đủ thông tin",
  EMAIL_REQUIRED: "Email là bắt buộc",
  PASSWORD_REQUIRED: "Mật khẩu là bắt buộc",
  OLD_PASSWORD_INCORRECT: "Mật khẩu cũ không đúng",
  CHANGE_PASSWORD_SUCCESS: "Đổi mật khẩu thành công",

  PASSWORD_TOO_SHORT: "Mật khẩu phải có ít nhất 6 ký tự",
  EMAIL_INVALID: "Email không hợp lệ",
  PHONENUMBER_INVALID: "Số điện thoại không hợp lệ",

  USERNAME_EXISTED: "Tên đăng nhập đã tồn tại",
  EMAIL_EXISTED: "Email đã tồn tại",

  TOKEN_EXPIRED: "Token đã hết hạn",

  // THÔNG BÁO THÀNH CÔNG/THẤT BẠI
  REGISTER_SUCCESS: "Đăng ký thành công",
  LOGIN_SUCCESS: "Đăng nhập thành công",
  LOGOUT_SUCCESS: "Đăng xuất thành công",
  RESET_PASSWORD_SUCCESS: "Đặt lại mật khẩu thành công",

  LOGIN_FAILED: "Tên đăng nhập hoặc mật khẩu không đúng",
  REGISTER_FAILED: "Đăng ký thất bại",
  LOGOUT_FAILED: "Đăng xuất thất bại",

  // THÔNG BÁO USER
  USER_NOT_FOUND: "Người dùng không tồn tại",
  ROLE_NOT_FOUND: "Vai trò không tồn tại",
  USER_BANNED: "Tài khoản đã bị khóa",
  FORGOT_PASSWORD_BODY:
    "Bạn đã yêu cầu lấy lại mật khẩu. Vui lòng kiểm tra email để đặt lại mật khẩu.",
  PROFILE_NOT_FOUND: "Không tìm thấy hồ sơ người dùng",
  EMAIL_VERIFY_SUCCESS: "Xác thực email thành công",
  EMAIL_ALREADY_VERIFIED: "Email đã được xác thực",
  EMAIL_VERIFY_SUBJECT: "Xác thực địa chỉ email",
  EMAIL_VERIFY_BODY: "Vui lòng nhấn vào liên kết trong email để xác thực tài khoản.",
  REGISTER_VERIFY_SENT: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
  EMAIL_NOT_VERIFIED: "Email chưa được xác thực. Vui lòng kiểm tra email.",
  ACCOUNT_NOT_ACTIVE: "Tài khoản chưa được kích hoạt. Vui lòng xác thực email.",

  // THÔNG BÁO CANDIDATE
  CANDIDATE_SOCIAL_FETCH_SUCCESS: "Lấy thông tin mạng xã hội của ứng viên thành công",
  CANDIDATE_SOCIAL_FETCH_FAILED: "Lấy thông tin mạng xã hội của ứng viên thất bại",
  // thêm SOCIAL 
  CANDIDATE_SOCIAL_CREATE_SUCCESS: "Thêm mạng xã hội cho ứng viên thành công",
  CANDIDATE_SOCIAL_CREATE_FAILED: "Thêm mạng xã hội cho ứng viên thất bại",
  // cập nhật SOCIAL
  CANDIDATE_SOCIAL_UPDATE_SUCCESS: "Cập nhật mạng xã hội của ứng viên thành công",
  CANDIDATE_SOCIAL_UPDATE_FAILED: "Cập nhật mạng xã hội của ứng viên thất bại",
  // xóa SOCIAL
  CANDIDATE_SOCIAL_DELETE_SUCCESS: "Xóa mạng xã hội của ứng viên thành công",
  CANDIDATE_SOCIAL_DELETE_FAILED: "Xóa mạng xã hội của ứng viên thất bại",
  // lấy PROFILE
  CANDIDATE_PROFILE_FETCH_SUCCESS: "Lấy hồ sơ ứng viên thành công",
  CANDIDATE_PROFILE_FETCH_FAILED: "Lấy hồ sơ ứng viên thất bại",
  // tạo PROFILE
  CANDIDATE_PROFILE_CREATE_SUCCESS: "Tạo hồ sơ ứng viên thành công",
  CANDIDATE_PROFILE_CREATE_FAILED: "Tạo hồ sơ ứng viên thất bại",
  // cập nhật PROFILE
  CANDIDATE_PROFILE_UPDATE_SUCCESS: "Cập nhật hồ sơ ứng viên thành công",
  CANDIDATE_PROFILE_UPDATE_FAILED: "Cập nhật hồ sơ ứng viên thất bại",

  CANDIDATE_PROFILE_ALREADY_EXISTS: "Hồ sơ ứng viên đã tồn tại",
  CANDIDATE_SOCIAL_ALREADY_EXISTS: "Mạng xã hội của ứng viên đã tồn tại",

  /////////////////////////////////////////////////////
  // THÔNG BÁO JOB
  JOB_NOT_FOUND: "Không tìm thấy công việc",
  // CREATE JOB
  JOB_CREATE_SUCCESS: "Tạo công việc thành công",
  JOB_CREATE_FAILED: "Tạo công việc thất bại",
  // FETCH JOBS
  JOB_FETCH_SUCCESS: "Lấy danh sách công việc thành công",
  JOB_FETCH_FAILED: "Lấy danh sách công việc thất bại",
  // UPDATE JOB
  JOB_UPDATE_SUCCESS: "Cập nhật công việc thành công",
  JOB_UPDATE_FAILED: "Cập nhật công việc thất bại",
  // DELETE JOB
  JOB_DELETE_SUCCESS: "Xóa công việc thành công",
  JOB_DELETE_FAILED: "Xóa công việc thất bại",
  // DEACTIVATE JOB
  JOB_DEACTIVATE_SUCCESS: "Hủy kích hoạt công việc thành công",
  JOB_DEACTIVATE_FAILED: "Hủy kích hoạt công việc thất bại",

  /////////////////////////////////////////////////////
  // THÔNG BÁO TAG
  TAG_NOT_FOUND: "Không tìm thấy thẻ",
  // FETCH TAGS
  TAG_FETCH_SUCCESS: "Lấy danh sách thẻ thành công",
  TAG_FETCH_FAILED: "Lấy danh sách thẻ thất bại",
  // CREATE TAG
  TAG_CREATE_SUCCESS: "Tạo thẻ thành công",
  TAG_CREATE_FAILED: "Tạo thẻ thất bại",

  /////////////////////////////////////////////////////
  // THÔNG BÁO COMPANY
  COMPANY_NOT_FOUND: "Không tìm thấy công ty",
  COMPANY_FETCH_SUCCESS: "Lấy thông tin công ty thành công",
  COMPANY_FETCH_FAILED: "Lấy thông tin công ty thất bại",

  /////////////////////////////////////////////////////
  // THÔNG BÁO CATEGORY
  CATEGORY_NOT_FOUND: "Không tìm thấy danh mục",
  // FETCH CATEGORIES
  CATEGORY_FETCH_SUCCESS: "Lấy danh sách danh mục thành công",
  CATEGORY_FETCH_FAILED: "Lấy danh sách danh mục thất bại",
  // CREATE CATEGORY
  CATEGORY_CREATE_SUCCESS: "Tạo danh mục thành công",
  CATEGORY_CREATE_FAILED: "Tạo danh mục thất bại",

  ////////////////////////////////////////////////////////

  // CV
  CV_NOT_FOUND: "Không tìm thấy CV",
  CV_ALREADY_EXISTS: "CV đã tồn tại",
  CV_FILETYPE_INVALID: "Định dạng tệp không hỗ trợ",
  CV_FILESIZE_EXCEEDED: "Tệp vượt quá dung lượng cho phép",
  CV_FILE_REQUIRED: "Vui lòng chọn tệp CV",
  // lấy CV
  CV_FETCH_SUCCESS: "Lấy CV thành công",
  CV_FETCH_FAILED: "Lấy CV thất bại",
  // tải CV
  CV_UPLOAD_SUCCESS: "Tải CV thành công",
  CV_UPLOAD_FAILED: "Tải CV thất bại",
  // cập nhật CV
  CV_UPDATE_SUCCESS: "Cập nhật CV thành công",
  CV_UPDATE_FAILED: "Cập nhật CV thất bại",
  // xóa CV
  CV_DELETE_SUCCESS: "Xóa CV thành công",
  CV_DELETE_FAILED: "Xóa CV thất bại",


  
  // AVATAR
  AVATAR_NOT_FOUND: "Không tìm thấy ảnh đại diện",
  AVATAR_ALREADY_EXISTS: "Ảnh đại diện đã tồn tại",
  AVATAR_FILETYPE_INVALID: "Định dạng ảnh không hỗ trợ",
  AVATAR_FILESIZE_EXCEEDED: "Ảnh vượt quá dung lượng cho phép",
  AVATAR_FILE_REQUIRED: "Vui lòng chọn ảnh đại diện",
  
  // lấy AVATAR
  AVATAR_FETCH_SUCCESS: "Lấy ảnh đại diện thành công",
  AVATAR_FETCH_FAILED: "Lấy ảnh đại diện thất bại",
  // tải AVATAR
  AVATAR_UPLOAD_SUCCESS: "Tải ảnh đại diện thành công",
  AVATAR_UPLOAD_FAILED: "Tải ảnh đại diện thất bại",
  // cập nhật AVATAR
  AVATAR_UPDATE_SUCCESS: "Cập nhật ảnh đại diện thành công",
  AVATAR_UPDATE_FAILED: "Cập nhật ảnh đại diện thất bại",
  // xóa AVATAR
  AVATAR_DELETE_SUCCESS: "Xóa ảnh đại diện thành công",
  AVATAR_DELETE_FAILED: "Xóa ảnh đại diện thất bại",
  
  // Lấy danh sách công việc đã ứng tuyển
  CANDIDATE_APPLIED_JOBS_FETCH_SUCCESS: "Lấy danh sách công việc đã ứng tuyển thành công",
  CANDIDATE_APPLIED_JOBS_FETCH_FAILED: "Lấy danh sách công việc đã ứng tuyển thất bại",

  // Ứng tuyển công việc
  APPLY_JOB_SUCCESS: "Ứng tuyển công việc thành công",
  APPLY_JOB_FAILED: "Ứng tuyển công việc thất bại",
  ALREADY_APPLIED: "Bạn đã ứng tuyển công việc này rồi",

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
};
