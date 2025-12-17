import { renderHook, act } from "@testing-library/react";
import { useEditPatientForm } from "../useEditPatientForm";

// Mock the patient queries hook
const mockMutateAsync = jest.fn();
jest.mock("@/hooks/usePatientQueries", () => ({
  useUpdatePatient: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

// Mock the transformer utilities
jest.mock("@/utils/apiTransformers", () => ({
  transformPriorityToApi: jest.fn((priority) => priority),
  transformStatusToApi: jest.fn((status) => status),
}));

// Mock form helpers
jest.mock("@/utils/formHelpers", () => ({
  formatPhoneNumber: jest.fn((phone) => phone),
}));

describe("useEditPatientForm", () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  // Helper to create proper form event mock
  const createMockFormEvent = () =>
    ({ preventDefault: jest.fn() } as unknown as React.FormEvent);

  const defaultInitialData = {
    name: "Test Patient",
    phone: "(11) 99999-9999",
    birthDate: new Date("1990-01-01"),
    priority: "2",
    status: "A",
    mainComplaint: "Test complaint",
    startDate: new Date("2024-01-01"),
    dischargeDate: null,
    nextAttendanceDates: [],
    currentRecommendations: {
      food: "Test food",
      water: "Test water",
      ointment: "Test ointment",
      returnWeeks: 2,
      lightBath: false,
      rod: false,
      spiritualTreatment: true,
    },
  };

  const defaultProps = {
    patientId: "123",
    initialData: defaultInitialData,
    onClose: mockOnClose,
    onSuccess: mockOnSuccess,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("initializes with provided data", () => {
    const { result } = renderHook(() => useEditPatientForm(defaultProps));

    expect(result.current.patient).toEqual(defaultInitialData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("updates patient field data with text input", () => {
    const { result } = renderHook(() => useEditPatientForm(defaultProps));

    act(() => {
      const mockEvent = {
        target: { name: "name", value: "Updated Name", type: "text" },
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.handleChange(mockEvent);
    });

    expect(result.current.patient.name).toBe("Updated Name");
  });

  it("handles phone number changes", () => {
    const { result } = renderHook(() => useEditPatientForm(defaultProps));

    act(() => {
      const mockEvent = {
        target: { name: "phone", value: "11999999999", type: "text" },
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.handleChange(mockEvent);
    });

    expect(result.current.patient.phone).toBe("11999999999");
  });

  it("handles date field changes", () => {
    const { result } = renderHook(() => useEditPatientForm(defaultProps));

    act(() => {
      const mockEvent = {
        target: { name: "birthDate", value: "1995-05-15", type: "date" },
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.handleChange(mockEvent);
    });

    expect(result.current.patient.birthDate).toEqual(new Date("1995-05-15"));
  });

  it("handles nested recommendation changes", () => {
    const { result } = renderHook(() => useEditPatientForm(defaultProps));

    act(() => {
      const mockEvent = {
        target: {
          name: "recommendations.food",
          value: "New food recommendation",
          type: "text",
        },
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.handleChange(mockEvent);
    });

    expect(result.current.patient.currentRecommendations.food).toBe(
      "New food recommendation"
    );
  });

  it("handles checkbox recommendation changes", () => {
    const { result } = renderHook(() => useEditPatientForm(defaultProps));

    act(() => {
      const mockEvent = {
        target: {
          name: "recommendations.lightBath",
          type: "checkbox",
          checked: true,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.handleChange(mockEvent);
    });

    expect(result.current.patient.currentRecommendations.lightBath).toBe(true);
  });

  it("handles number field changes", () => {
    const { result } = renderHook(() => useEditPatientForm(defaultProps));

    act(() => {
      const mockEvent = {
        target: {
          name: "recommendations.returnWeeks",
          value: "4",
          type: "number",
        },
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.handleChange(mockEvent);
    });

    expect(result.current.patient.currentRecommendations.returnWeeks).toBe(4);
  });

  it("resets form when initialData changes", () => {
    const newInitialData = { ...defaultInitialData, name: "New Patient Name" };
    const { result, rerender } = renderHook(
      (props) => useEditPatientForm(props),
      { initialProps: defaultProps }
    );

    // Change a field
    act(() => {
      const mockEvent = {
        target: { name: "name", value: "Modified Name", type: "text" },
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.handleChange(mockEvent);
    });

    expect(result.current.patient.name).toBe("Modified Name");

    // Update initialData prop
    rerender({
      ...defaultProps,
      initialData: newInitialData,
    });

    expect(result.current.patient.name).toBe("New Patient Name");
    expect(result.current.error).toBe(null);
  });

  it("exposes required functions and state", () => {
    const { result } = renderHook(() => useEditPatientForm(defaultProps));

    expect(typeof result.current.handleChange).toBe("function");
    expect(typeof result.current.handleSpiritualConsultationChange).toBe(
      "function"
    );
    expect(typeof result.current.handleSubmit).toBe("function");
    expect(typeof result.current.setError).toBe("function");
    expect(typeof result.current.patient).toBe("object");
    expect(typeof result.current.isLoading).toBe("boolean");
    expect(result.current.error).toBe(null);
  });

  it("handles setError function", () => {
    const { result } = renderHook(() => useEditPatientForm(defaultProps));

    act(() => {
      result.current.setError("Test error");
    });

    expect(result.current.error).toBe("Test error");

    act(() => {
      result.current.setError(null);
    });

    expect(result.current.error).toBe(null);
  });

  it("maintains form state integrity", () => {
    const { result } = renderHook(() => useEditPatientForm(defaultProps));

    // Verify initial state
    expect(result.current.patient.name).toBe("Test Patient");
    expect(result.current.patient.currentRecommendations.food).toBe(
      "Test food"
    );

    // Change one field
    act(() => {
      const mockEvent = {
        target: { name: "name", value: "New Name", type: "text" },
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.handleChange(mockEvent);
    });

    // Other fields should remain unchanged
    expect(result.current.patient.name).toBe("New Name");
    expect(result.current.patient.phone).toBe("(11) 99999-9999");
    expect(result.current.patient.currentRecommendations.food).toBe(
      "Test food"
    );
  });

  // Tests for uncovered functionality
  describe("Date handling and validation", () => {
    it("should clear date when empty string is provided", () => {
      const { result } = renderHook(() => useEditPatientForm(defaultProps));

      act(() => {
        const mockEvent = {
          target: { name: "birthDate", value: "", type: "date" },
        } as React.ChangeEvent<HTMLInputElement>;
        result.current.handleChange(mockEvent);
      });

      expect(result.current.patient.birthDate).toBeNull();
    });
  });

  describe("Spiritual consultation change handling", () => {
    it("should handle discharge date changes", () => {
      const { result } = renderHook(() => useEditPatientForm(defaultProps));

      act(() => {
        const mockEvent = {
          target: { name: "dischargeDate", value: "2024-12-31" },
        } as React.ChangeEvent<HTMLInputElement>;
        result.current.handleSpiritualConsultationChange(mockEvent);
      });

      expect(result.current.patient.dischargeDate).toEqual(
        new Date("2024-12-31")
      );
    });

    it("should clear discharge date when empty", () => {
      const { result } = renderHook(() => useEditPatientForm(defaultProps));

      act(() => {
        const mockEvent = {
          target: { name: "dischargeDate", value: "" },
        } as React.ChangeEvent<HTMLInputElement>;
        result.current.handleSpiritualConsultationChange(mockEvent);
      });

      expect(result.current.patient.dischargeDate).toBeNull();
    });

    it("should handle next attendance date changes", () => {
      const { result } = renderHook(() => useEditPatientForm(defaultProps));

      act(() => {
        const mockEvent = {
          target: { name: "nextDate", value: "2024-02-15" },
        } as React.ChangeEvent<HTMLInputElement>;
        result.current.handleSpiritualConsultationChange(mockEvent);
      });

      expect(result.current.patient.nextAttendanceDates).toEqual([
        { date: new Date("2024-02-15"), type: "spiritual" },
      ]);
    });

    it("should clear next attendance dates when empty", () => {
      const { result } = renderHook(() => useEditPatientForm(defaultProps));

      act(() => {
        const mockEvent = {
          target: { name: "nextDate", value: "" },
        } as React.ChangeEvent<HTMLInputElement>;
        result.current.handleSpiritualConsultationChange(mockEvent);
      });

      expect(result.current.patient.nextAttendanceDates).toEqual([]);
    });

    it("should handle other date fields in spiritual consultation", () => {
      const { result } = renderHook(() => useEditPatientForm(defaultProps));

      act(() => {
        const mockEvent = {
          target: { name: "startDate", value: "2024-01-15" },
        } as React.ChangeEvent<HTMLInputElement>;
        result.current.handleSpiritualConsultationChange(mockEvent);
      });

      expect(result.current.patient.startDate).toEqual(new Date("2024-01-15"));
    });

    it("should handle invalid date strings in spiritual consultation changes", () => {
      const { result } = renderHook(() => useEditPatientForm(defaultProps));

      act(() => {
        const mockEvent = {
          target: { name: "dischargeDate", value: "invalid-date" },
        } as React.ChangeEvent<HTMLInputElement>;
        result.current.handleSpiritualConsultationChange(mockEvent);
      });

      // Should create a new Date() when invalid date is provided
      expect(result.current.patient.dischargeDate).toBeInstanceOf(Date);
    });
  });

  describe("Form validation", () => {
    it("should validate required name field", async () => {
      const { result } = renderHook(() => useEditPatientForm(defaultProps));

      // Clear the name
      act(() => {
        const mockEvent = {
          target: { name: "name", value: "   ", type: "text" },
        } as React.ChangeEvent<HTMLInputElement>;
        result.current.handleChange(mockEvent);
      });

      await act(async () => {
        const mockEvent = createMockFormEvent();
        await result.current.handleSubmit(mockEvent);
      });

      expect(result.current.error).toBe("Nome é obrigatório");
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it("should validate required birth date field", async () => {
      const initialDataNoBirthDate = {
        ...defaultInitialData,
        birthDate: null,
      };

      const { result } = renderHook(() =>
        useEditPatientForm({
          ...defaultProps,
          initialData: initialDataNoBirthDate,
        })
      );

      await act(async () => {
        const mockEvent = createMockFormEvent();
        await result.current.handleSubmit(mockEvent);
      });

      expect(result.current.error).toBe("Data de nascimento é obrigatória");
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it("should validate phone format when provided", async () => {
      const { result } = renderHook(() => useEditPatientForm(defaultProps));

      // Set invalid phone format
      act(() => {
        const mockEvent = {
          target: { name: "phone", value: "123456789", type: "text" },
        } as React.ChangeEvent<HTMLInputElement>;
        result.current.handleChange(mockEvent);
      });

      await act(async () => {
        const mockEvent = createMockFormEvent();
        await result.current.handleSubmit(mockEvent);
      });

      expect(result.current.error).toBe(
        "Telefone deve estar no formato (XX) XXXXX-XXXX"
      );
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it("should pass validation with valid phone format", async () => {
      mockMutateAsync.mockResolvedValue({ id: 123, name: "Updated Patient" });
      const { result } = renderHook(() => useEditPatientForm(defaultProps));

      // Set valid phone format
      act(() => {
        const mockEvent = {
          target: { name: "phone", value: "(11) 98765-4321", type: "text" },
        } as React.ChangeEvent<HTMLInputElement>;
        result.current.handleChange(mockEvent);
      });

      await act(async () => {
        const mockEvent = createMockFormEvent();
        await result.current.handleSubmit(mockEvent);
      });

      expect(result.current.error).toBeNull();
      expect(mockMutateAsync).toHaveBeenCalled();
    });

    it("should allow empty phone number", async () => {
      mockMutateAsync.mockResolvedValue({ id: 123, name: "Updated Patient" });
      const { result } = renderHook(() => useEditPatientForm(defaultProps));

      // Clear phone
      act(() => {
        const mockEvent = {
          target: { name: "phone", value: "", type: "text" },
        } as React.ChangeEvent<HTMLInputElement>;
        result.current.handleChange(mockEvent);
      });

      await act(async () => {
        const mockEvent = createMockFormEvent();
        await result.current.handleSubmit(mockEvent);
      });

      expect(result.current.error).toBeNull();
      expect(mockMutateAsync).toHaveBeenCalled();
    });
  });

  describe("Form submission", () => {
    it("should handle successful form submission with all fields", async () => {
      const mockUpdatedPatient = { id: 123, name: "Updated Patient" };
      mockMutateAsync.mockResolvedValue(mockUpdatedPatient);
      const { result } = renderHook(() => useEditPatientForm(defaultProps));

      await act(async () => {
        const mockEvent = createMockFormEvent();
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockMutateAsync).toHaveBeenCalledWith({
        patientId: "123",
        data: expect.objectContaining({
          name: "Test Patient",
          phone: "(11) 99999-9999",
          birth_date: "1990-01-01",
          main_complaint: "Test complaint",
        }),
      });
      expect(mockOnSuccess).toHaveBeenCalledWith(mockUpdatedPatient);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should handle form submission without optional phone", async () => {
      const mockUpdatedPatient = { id: 123, name: "Updated Patient" };
      mockMutateAsync.mockResolvedValue(mockUpdatedPatient);

      const initialDataNoPhone = {
        ...defaultInitialData,
        phone: "",
      };

      const { result } = renderHook(() =>
        useEditPatientForm({
          ...defaultProps,
          initialData: initialDataNoPhone,
        })
      );

      await act(async () => {
        const mockEvent = createMockFormEvent();
        await result.current.handleSubmit(mockEvent);
      });

      const callArgs = mockMutateAsync.mock.calls[0][0];
      expect(callArgs.data).not.toHaveProperty("phone");
    });

    it("should handle form submission with invalid birth date", async () => {
      const mockUpdatedPatient = { id: 123, name: "Updated Patient" };
      mockMutateAsync.mockResolvedValue(mockUpdatedPatient);

      const initialDataInvalidDate = {
        ...defaultInitialData,
        birthDate: new Date("invalid"),
      };

      const { result } = renderHook(() =>
        useEditPatientForm({
          ...defaultProps,
          initialData: initialDataInvalidDate,
        })
      );

      await act(async () => {
        const mockEvent = createMockFormEvent();
        await result.current.handleSubmit(mockEvent);
      });

      const callArgs = mockMutateAsync.mock.calls[0][0];
      expect(callArgs.data).not.toHaveProperty("birth_date");
    });

    it("should handle API errors during submission", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockMutateAsync.mockRejectedValue(new Error("API Error"));

      const { result } = renderHook(() => useEditPatientForm(defaultProps));

      await act(async () => {
        const mockEvent = createMockFormEvent();
        await result.current.handleSubmit(mockEvent);
      });

      expect(result.current.error).toBe("Erro interno do servidor");
      expect(result.current.isLoading).toBe(false);
      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it("should handle form submission without onSuccess callback", async () => {
      const mockUpdatedPatient = { id: 123, name: "Updated Patient" };
      mockMutateAsync.mockResolvedValue(mockUpdatedPatient);

      const propsWithoutOnSuccess = {
        ...defaultProps,
        onSuccess: undefined,
      };

      const { result } = renderHook(() =>
        useEditPatientForm(propsWithoutOnSuccess)
      );

      await act(async () => {
        const mockEvent = createMockFormEvent();
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
