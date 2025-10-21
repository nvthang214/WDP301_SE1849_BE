import Profile from "../models/Profile.js";
import User from "../models/User.js";
import cloudinary from "../configs/cloudinary.js";
import uploadToCloudinary from "../lib/cloudinary/uploadToCloudinary.js";
import { MESSAGE } from "../constants/message.js";
import { toResultError, toResultOk } from "../results/Result.js";
import { Readable } from "stream";

const CV_ALLOWED_MIME_TYPES = ["application/pdf"];
const CV_MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
const CV_CLOUD_FOLDER = "candidate_cv";

const loadCandidateContext = async (userId) => {
	const user = await User.findById(userId).populate("role", "name");
	if (!user) {
		return {
			error: toResultError({ statusCode: 404, msg: MESSAGE.USER_NOT_FOUND }),
		};
	}

	if (user.role?.name !== "candidate") {
		return {
			error: toResultError({ statusCode: 403, msg: MESSAGE.FORBIDDEN }),
		};
	}

	const profile = await Profile.findOne({ user: user._id });
	return { user, profile };
};

const parseCvField = (value) => {
	if (!value) return null;

	if (typeof value === "object" && value.url) {
		return value;
	}

	if (typeof value === "string") {
		try {
			const parsed = JSON.parse(value);
			if (parsed && typeof parsed === "object") {
				return parsed;
			}
		} catch (err) {
			return { url: value };
		}
	}

	return null;
};

const formatCvResponse = (cvData) => {
	if (!cvData) return null;
	return {
		url: cvData.url || "",
		fileName: cvData.fileName || "",
		fileSize: cvData.fileSize ?? null,
		mimeType: cvData.mimeType || "",
		uploadedAt: cvData.uploadedAt || null,
	};
};

const validateCvFile = (file) => {
	if (!file) {
		return toResultError({ statusCode: 400, msg: MESSAGE.CV_FILE_REQUIRED });
	}

	if (!CV_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
		return toResultError({ statusCode: 400, msg: MESSAGE.CV_FILETYPE_INVALID });
	}

	if (file.size > CV_MAX_SIZE_BYTES) {
		return toResultError({
			statusCode: 400,
			msg: MESSAGE.CV_FILESIZE_EXCEEDED,
		});
	}

	return null;
};

const buildCvPayload = (file, uploadResult) => ({
	url: uploadResult.url,
	publicId: uploadResult.public_id,
	fileName: file.originalname,
	fileSize: file.size,
	mimeType: file.mimetype,
	uploadedAt: new Date().toISOString(),
});

const uploadCandidateCvFile = async (file) => {
	if (file.mimetype === "application/pdf") {
		return new Promise((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{ folder: CV_CLOUD_FOLDER, resource_type: "raw" },
				(error, result) => {
					if (error) return reject(error);
					resolve({ url: result.secure_url, public_id: result.public_id });
				}
			);
			Readable.from(file.buffer).pipe(uploadStream);
		});
	}

	return uploadToCloudinary(file.buffer, CV_CLOUD_FOLDER);
};

const persistCv = async (userId, profile, payload) => {
	const serialized = JSON.stringify(payload);

	if (profile) {
		profile.cv = serialized;
		await profile.save();
		return profile;
	}

	const created = await Profile.create({ user: userId, cv: serialized });
	return created;
};

const cleanupCloudinaryAsset = async (publicId, mimeType) => {
	if (!publicId) return;

	const resourceTypes = mimeType === "application/pdf" ? ["raw", "image"] : ["image", "raw"];

	let lastError = null;

	for (const resourceType of resourceTypes) {
		try {
			const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
			if (result?.result === "ok" || result?.result === "not found") {
				return;
			}
		} catch (error) {
			lastError = error;
		}
	}

	if (lastError) {
		console.error(" Failed to destroy Cloudinary asset", {
			publicId,
			mimeType,
			error: lastError,
		});
	}
};

export const getCandidateCv = async (req, res) => {
	try {
		const { userId } = req.params;
		const context = await loadCandidateContext(userId);
		if (context.error) {
			return res.status(context.error.statusCode).json(context.error);
		}

		const { profile } = context;
		if (!profile || !profile.cv) {
			return res
				.status(404)
				.json(toResultError({ statusCode: 404, msg: MESSAGE.CV_NOT_FOUND }));
		}

		const cvData = formatCvResponse(parseCvField(profile.cv));
		return res.json(
			toResultOk({
				msg: MESSAGE.CV_FETCH_SUCCESS,
				data: cvData,
			})
		);
	} catch (error) {
		console.error(" getCandidateCv", error);
		return res
			.status(500)
			.json(toResultError({ statusCode: 500, msg: MESSAGE.CV_FETCH_FAILED }));
	}
};

export const addCandidateCv = async (req, res) => {
	try {
		const { userId } = req.params;
		const context = await loadCandidateContext(userId);
		if (context.error) {
			return res.status(context.error.statusCode).json(context.error);
		}

		const fileValidationError = validateCvFile(req.file);
		if (fileValidationError) {
			return res.status(fileValidationError.statusCode).json(fileValidationError);
		}

		const { profile, user } = context;
		if (profile && profile.cv) {
			return res
				.status(409)
				.json(toResultError({ statusCode: 409, msg: MESSAGE.CV_ALREADY_EXISTS }));
		}

		const uploadResult = await uploadCandidateCvFile(req.file);
		const payload = buildCvPayload(req.file, uploadResult);

		await persistCv(user._id, profile, payload);

		const responseData = formatCvResponse(payload);
		return res
			.status(201)
			.json(
				toResultOk({
					statusCode: 201,
					msg: MESSAGE.CV_UPLOAD_SUCCESS,
					data: responseData,
				})
			);
	} catch (error) {
		console.error(" addCandidateCv", error);
		return res
			.status(500)
			.json(toResultError({ statusCode: 500, msg: MESSAGE.CV_UPLOAD_FAILED }));
	}
};

export const updateCandidateCv = async (req, res) => {
	try {
		const { userId } = req.params;
		const context = await loadCandidateContext(userId);
		if (context.error) {
			return res.status(context.error.statusCode).json(context.error);
		}

		const fileValidationError = validateCvFile(req.file);
		if (fileValidationError) {
			return res.status(fileValidationError.statusCode).json(fileValidationError);
		}

		const { profile, user } = context;
		if (!profile || !profile.cv) {
			return res
				.status(404)
				.json(toResultError({ statusCode: 404, msg: MESSAGE.CV_NOT_FOUND }));
		}

		const existingCv = parseCvField(profile.cv);

			const uploadResult = await uploadCandidateCvFile(req.file);
		const payload = buildCvPayload(req.file, uploadResult);

		await persistCv(user._id, profile, payload);

			await cleanupCloudinaryAsset(
				existingCv?.publicId || existingCv?.public_id,
				existingCv?.mimeType
			);

		const responseData = formatCvResponse(payload);
		return res.json(
			toResultOk({
				msg: MESSAGE.CV_UPDATE_SUCCESS,
				data: responseData,
			})
		);
	} catch (error) {
		console.error(" updateCandidateCv", error);
		return res
			.status(500)
			.json(toResultError({ statusCode: 500, msg: MESSAGE.CV_UPDATE_FAILED }));
	}
};

export const deleteCandidateCv = async (req, res) => {
	try {
		const { userId } = req.params;
		const context = await loadCandidateContext(userId);
		if (context.error) {
			return res.status(context.error.statusCode).json(context.error);
		}

		const { profile } = context;
		if (!profile || !profile.cv) {
			return res
				.status(404)
				.json(toResultError({ statusCode: 404, msg: MESSAGE.CV_NOT_FOUND }));
		}

		const existingCv = parseCvField(profile.cv);
		profile.cv = null;
		await profile.save();

			await cleanupCloudinaryAsset(
				existingCv?.publicId || existingCv?.public_id,
				existingCv?.mimeType
			);

		return res.json(toResultOk({ msg: MESSAGE.CV_DELETE_SUCCESS }));
	} catch (error) {
		console.error(" deleteCandidateCv", error);
		return res
			.status(500)
			.json(toResultError({ statusCode: 500, msg: MESSAGE.CV_DELETE_FAILED }));
	}
};
