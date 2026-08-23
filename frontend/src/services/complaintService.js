import api from "../api";

/* =========================================================
   RESIDENT - SUBMIT
========================================================= */

export const uploadEvidence = async (
  files
) => {
  const formData =
    new FormData();

  files.forEach((file) => {
    formData.append(
      "evidence",
      file
    );
  });

  const response =
    await api.post(
      "/complaints/upload",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

  return response.data;
};

export const submitComplaint =
  async (complaintData) => {
    const response =
      await api.post(
        "/complaints",
        complaintData
      );

    return response.data;
  };

/* =========================================================
   RESIDENT - PRIVATE TOKEN
========================================================= */

export const trackComplaint =
  async (token) => {
    const response =
      await api.post(
        "/complaints/track",
        {
          token:
            token.trim(),
        }
      );

    return response.data;
  };

export const addFollowUp =
  async (
    token,
    note,
    evidence = []
  ) => {
    const response =
      await api.post(
        "/complaints/follow-up",
        {
          token,
          note,
          evidence,
        }
      );

    return response.data;
  };

export const answerReviewQuestion =
  async (
    token,
    questionId,
    answer
  ) => {
    const response =
      await api.post(
        "/complaints/answer",
        {
          token,
          questionId,
          answer,
        }
      );

    return response.data;
  };

export const verifyRepair =
  async (
    token,
    action,
    comment = ""
  ) => {
    const response =
      await api.post(
        "/complaints/verify-repair",
        {
          token,
          action,
          comment,
        }
      );

    return response.data;
  };

export const acceptSiteInspection =
  async (token) => {
    const response =
      await api.post(
        "/complaints/accept-inspection",
        {
          token,
        }
      );

    return response.data;
  };

/* =========================================================
   ADMIN
========================================================= */

export const getComplaintsForAdmin =
  async (filters = {}) => {
    const params =
      new URLSearchParams(
        filters
      ).toString();

    const response =
      await api.get(
        `/complaints/admin${
          params
            ? `?${params}`
            : ""
        }`
      );

    return response.data;
  };

export const getComplaintByIdForAdmin =
  async (id) => {
    const response =
      await api.get(
        `/complaints/admin/${id}`
      );

    return response.data;
  };

/* =========================================================
   ADMIN - CONFIDENTIAL QUESTION
========================================================= */

export const askReviewQuestion =
  async (
    id,
    question
  ) => {
    const response =
      await api.post(
        `/complaints/admin/${id}/question`,
        {
          question,
        }
      );

    return response.data;
  };

/* =========================================================
   ADMIN - MANAGER CONFLICT
========================================================= */

export const updateManagerConflict =
  async (
    id,
    concernsManager
  ) => {
    const response =
      await api.put(
        `/complaints/admin/${id}/manager-conflict`,
        {
          concernsManager,
        }
      );

    return response.data;
  };

/* =========================================================
   ADMIN - AUTHORIZED ALTERNATIVE
========================================================= */

export const assignAuthorizedAlternative =
  async (
    id,
    name,
    authority,
    contact
  ) => {
    const response =
      await api.put(
        `/complaints/admin/${id}/alternative-handler`,
        {
          name,
          authority,
          contact,
        }
      );

    return response.data;
  };

/* =========================================================
   ADMIN - FINAL NOTE
========================================================= */

export const setComplaintNote =
  async (
    id,
    note
  ) => {
    const response =
      await api.put(
        `/complaints/admin/${id}/note`,
        {
          note,
        }
      );

    return response.data;
  };

/* =========================================================
   ADMIN - REVIEW DECISION
========================================================= */

export const submitReviewDecision =
  async (
    id,
    decisionData
  ) => {
    const response =
      await api.put(
        `/complaints/${id}/review`,
        decisionData
      );

    return response.data;
  };

/* =========================================================
   ADMIN - SITE INSPECTION
========================================================= */

export const requestSiteInspection =
  async (
    id,
    note = ""
  ) => {
    const response =
      await api.put(
        `/complaints/${id}/inspection`,
        {
          note,
        }
      );

    return response.data;
  };

/* =========================================================
   ADMIN - ANALYTICS
========================================================= */

export const getComplaintAnalytics =
  async () => {
    const response =
      await api.get(
        "/complaints/admin/analytics"
      );

    return response.data;
  };

/* =========================================================
   MANAGER
========================================================= */

export const getComplaintsForManager =
  async (filters = {}) => {
    const params =
      new URLSearchParams(
        filters
      ).toString();

    const response =
      await api.get(
        `/complaints${
          params
            ? `?${params}`
            : ""
        }`
      );

    return response.data;
  };

export const getComplaintStatsForManager =
  async () => {
    const response =
      await api.get(
        "/complaints/stats"
      );

    return response.data;
  };

export const getComplaintByIdForManager =
  async (id) => {
    const response =
      await api.get(
        `/complaints/${id}`
      );

    return response.data;
  };

/* =========================================================
   MANAGER - ASSIGN WORK ORDER
========================================================= */

export const assignComplaint =
  async (
    id,
    workerType,
    workerName,
    targetCompletionDate,
    priority
  ) => {
    const response =
      await api.put(
        `/complaints/${id}/assign`,
        {
          workerType,
          workerName,
          targetCompletionDate,
          priority,
        }
      );

    return response.data;
  };

/* =========================================================
   MANAGER - UPDATE STATUS
========================================================= */

export const updateComplaintStatus =
  async (
    id,
    status,
    note = ""
  ) => {
    const response =
      await api.put(
        `/complaints/${id}/status`,
        {
          status,
          note,
        }
      );

    return response.data;
  };

/* =========================================================
   MANAGER - COMPLETION EVIDENCE
========================================================= */

export const uploadCompletionEvidence =
  async (
    id,
    files
  ) => {
    const formData =
      new FormData();

    files.forEach((file) => {
      formData.append(
        "evidence",
        file
      );
    });

    const response =
      await api.post(
        `/complaints/${id}/completion-evidence`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return response.data;
  };