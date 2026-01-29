/**
 * CreateEmployeeForm Component Tests
 * Task Group 24: Component Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  mockService,
  mockEmployeeFormTranslations,
} from "./test-utils";
import { CreateEmployeeForm } from "@/components/employees/CreateEmployeeForm";

// Mock the useCreateEmployee hook
vi.mock("@/lib/hooks/employees/useCreateEmployee", () => ({
  useCreateEmployee: vi.fn(() => ({
    fullName: "",
    setFullName: vi.fn(),
    email: "",
    setEmail: vi.fn(),
    phone: "",
    setPhone: vi.fn(),
    role: "",
    setRole: vi.fn(),
    preferredLanguage: "nb",
    setPreferredLanguage: vi.fn(),
    selectedServices: [],
    setSelectedServices: vi.fn(),
    saving: false,
    error: null,
    handleSubmit: vi.fn((e) => e.preventDefault()),
  })),
}));

import { useCreateEmployee } from "@/lib/hooks/employees/useCreateEmployee";

describe("CreateEmployeeForm", () => {
  const translations = mockEmployeeFormTranslations();
  const services = [
    mockService({ id: "svc-1", name: "Haircut" }),
    mockService({ id: "svc-2", name: "Beard Trim" }),
    mockService({ id: "svc-3", name: "Color" }),
  ];
  const defaultProps = {
    services,
    onEmployeeCreated: vi.fn(),
    translations,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock to default state
    vi.mocked(useCreateEmployee).mockReturnValue({
      fullName: "",
      setFullName: vi.fn(),
      email: "",
      setEmail: vi.fn(),
      phone: "",
      setPhone: vi.fn(),
      role: "",
      setRole: vi.fn(),
      preferredLanguage: "nb",
      setPreferredLanguage: vi.fn(),
      selectedServices: [],
      setSelectedServices: vi.fn(),
      saving: false,
      error: null,
      handleSubmit: vi.fn((e) => e.preventDefault()),
    });
  });

  describe("Rendering", () => {
    it("should render form title", () => {
      render(<CreateEmployeeForm {...defaultProps} />);
      expect(screen.getByRole("heading", { name: "Add Employee" })).toBeInTheDocument();
    });

    it("should render all form fields", () => {
      render(<CreateEmployeeForm {...defaultProps} />);

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/language/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/services/i)).toBeInTheDocument();
    });

    it("should render role dropdown with options", () => {
      render(<CreateEmployeeForm {...defaultProps} />);

      const roleSelect = screen.getByLabelText(/role/i);
      expect(roleSelect).toBeInTheDocument();

      expect(screen.getByRole("option", { name: "Select role" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Owner" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Manager" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Staff" })).toBeInTheDocument();
    });

    it("should render language dropdown with multiple options", () => {
      render(<CreateEmployeeForm {...defaultProps} />);

      const langSelect = screen.getByLabelText(/language/i);
      expect(langSelect).toBeInTheDocument();

      // Check some language options
      expect(screen.getByRole("option", { name: /norsk/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /english/i })).toBeInTheDocument();
    });

    it("should render services multi-select with provided services", () => {
      render(<CreateEmployeeForm {...defaultProps} />);

      expect(screen.getByRole("option", { name: "Haircut" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Beard Trim" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Color" })).toBeInTheDocument();
    });

    it("should render submit button", () => {
      render(<CreateEmployeeForm {...defaultProps} />);
      expect(screen.getByRole("button", { name: "Add Employee" })).toBeInTheDocument();
    });
  });

  describe("Form Interaction", () => {
    it("should call setFullName when name input changes", () => {
      const setFullName = vi.fn();
      vi.mocked(useCreateEmployee).mockReturnValue({
        fullName: "",
        setFullName,
        email: "",
        setEmail: vi.fn(),
        phone: "",
        setPhone: vi.fn(),
        role: "",
        setRole: vi.fn(),
        preferredLanguage: "nb",
        setPreferredLanguage: vi.fn(),
        selectedServices: [],
        setSelectedServices: vi.fn(),
        saving: false,
        error: null,
        handleSubmit: vi.fn((e) => e.preventDefault()),
      });

      render(<CreateEmployeeForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/full name/i);
      fireEvent.change(nameInput, { target: { value: "John Doe" } });

      expect(setFullName).toHaveBeenCalledWith("John Doe");
    });

    it("should call setEmail when email input changes", () => {
      const setEmail = vi.fn();
      vi.mocked(useCreateEmployee).mockReturnValue({
        fullName: "",
        setFullName: vi.fn(),
        email: "",
        setEmail,
        phone: "",
        setPhone: vi.fn(),
        role: "",
        setRole: vi.fn(),
        preferredLanguage: "nb",
        setPreferredLanguage: vi.fn(),
        selectedServices: [],
        setSelectedServices: vi.fn(),
        saving: false,
        error: null,
        handleSubmit: vi.fn((e) => e.preventDefault()),
      });

      render(<CreateEmployeeForm {...defaultProps} />);

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: "john@example.com" } });

      expect(setEmail).toHaveBeenCalledWith("john@example.com");
    });

    it("should call setRole when role is selected", () => {
      const setRole = vi.fn();
      vi.mocked(useCreateEmployee).mockReturnValue({
        fullName: "",
        setFullName: vi.fn(),
        email: "",
        setEmail: vi.fn(),
        phone: "",
        setPhone: vi.fn(),
        role: "",
        setRole,
        preferredLanguage: "nb",
        setPreferredLanguage: vi.fn(),
        selectedServices: [],
        setSelectedServices: vi.fn(),
        saving: false,
        error: null,
        handleSubmit: vi.fn((e) => e.preventDefault()),
      });

      render(<CreateEmployeeForm {...defaultProps} />);

      const roleSelect = screen.getByLabelText(/role/i);
      fireEvent.change(roleSelect, { target: { value: "staff" } });

      expect(setRole).toHaveBeenCalledWith("staff");
    });

    it("should call setPreferredLanguage when language is selected", () => {
      const setPreferredLanguage = vi.fn();
      vi.mocked(useCreateEmployee).mockReturnValue({
        fullName: "",
        setFullName: vi.fn(),
        email: "",
        setEmail: vi.fn(),
        phone: "",
        setPhone: vi.fn(),
        role: "",
        setRole: vi.fn(),
        preferredLanguage: "nb",
        setPreferredLanguage,
        selectedServices: [],
        setSelectedServices: vi.fn(),
        saving: false,
        error: null,
        handleSubmit: vi.fn((e) => e.preventDefault()),
      });

      render(<CreateEmployeeForm {...defaultProps} />);

      const langSelect = screen.getByLabelText(/language/i);
      fireEvent.change(langSelect, { target: { value: "en" } });

      expect(setPreferredLanguage).toHaveBeenCalledWith("en");
    });
  });

  describe("Form Submission", () => {
    it("should call handleSubmit when form is submitted", () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());
      vi.mocked(useCreateEmployee).mockReturnValue({
        fullName: "John Doe",
        setFullName: vi.fn(),
        email: "john@example.com",
        setEmail: vi.fn(),
        phone: "+47 123 45 678",
        setPhone: vi.fn(),
        role: "staff",
        setRole: vi.fn(),
        preferredLanguage: "en",
        setPreferredLanguage: vi.fn(),
        selectedServices: [],
        setSelectedServices: vi.fn(),
        saving: false,
        error: null,
        handleSubmit,
      });

      render(<CreateEmployeeForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", { name: "Add Employee" });
      fireEvent.click(submitButton);

      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe("Loading State", () => {
    it("should disable submit button when saving", () => {
      vi.mocked(useCreateEmployee).mockReturnValue({
        fullName: "John Doe",
        setFullName: vi.fn(),
        email: "",
        setEmail: vi.fn(),
        phone: "",
        setPhone: vi.fn(),
        role: "",
        setRole: vi.fn(),
        preferredLanguage: "nb",
        setPreferredLanguage: vi.fn(),
        selectedServices: [],
        setSelectedServices: vi.fn(),
        saving: true,
        error: null,
        handleSubmit: vi.fn(),
      });

      render(<CreateEmployeeForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", { name: "…" });
      expect(submitButton).toBeDisabled();
    });

    it("should show ellipsis text when saving", () => {
      vi.mocked(useCreateEmployee).mockReturnValue({
        fullName: "John Doe",
        setFullName: vi.fn(),
        email: "",
        setEmail: vi.fn(),
        phone: "",
        setPhone: vi.fn(),
        role: "",
        setRole: vi.fn(),
        preferredLanguage: "nb",
        setPreferredLanguage: vi.fn(),
        selectedServices: [],
        setSelectedServices: vi.fn(),
        saving: true,
        error: null,
        handleSubmit: vi.fn(),
      });

      render(<CreateEmployeeForm {...defaultProps} />);

      expect(screen.getByRole("button", { name: "…" })).toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("should display error message when error exists", () => {
      vi.mocked(useCreateEmployee).mockReturnValue({
        fullName: "",
        setFullName: vi.fn(),
        email: "",
        setEmail: vi.fn(),
        phone: "",
        setPhone: vi.fn(),
        role: "",
        setRole: vi.fn(),
        preferredLanguage: "nb",
        setPreferredLanguage: vi.fn(),
        selectedServices: [],
        setSelectedServices: vi.fn(),
        saving: false,
        error: "Employee limit reached",
        handleSubmit: vi.fn(),
      });

      render(<CreateEmployeeForm {...defaultProps} />);

      expect(screen.getByText("Employee limit reached")).toBeInTheDocument();
    });

    it("should have aria-live attribute on error message", () => {
      vi.mocked(useCreateEmployee).mockReturnValue({
        fullName: "",
        setFullName: vi.fn(),
        email: "",
        setEmail: vi.fn(),
        phone: "",
        setPhone: vi.fn(),
        role: "",
        setRole: vi.fn(),
        preferredLanguage: "nb",
        setPreferredLanguage: vi.fn(),
        selectedServices: [],
        setSelectedServices: vi.fn(),
        saving: false,
        error: "Error message",
        handleSubmit: vi.fn(),
      });

      render(<CreateEmployeeForm {...defaultProps} />);

      const errorElement = screen.getByText("Error message");
      expect(errorElement).toHaveAttribute("aria-live", "polite");
    });
  });

  describe("Validation Attributes", () => {
    it("should have required attribute on name input", () => {
      render(<CreateEmployeeForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/full name/i);
      expect(nameInput).toHaveAttribute("required");
    });

    it("should have email type on email input", () => {
      render(<CreateEmployeeForm {...defaultProps} />);

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute("type", "email");
    });

    it("should have tel type on phone input", () => {
      render(<CreateEmployeeForm {...defaultProps} />);

      const phoneInput = screen.getByLabelText(/phone/i);
      expect(phoneInput).toHaveAttribute("type", "tel");
    });

    it("should have multiple attribute on services select", () => {
      render(<CreateEmployeeForm {...defaultProps} />);

      const servicesSelect = screen.getByLabelText(/services/i);
      expect(servicesSelect).toHaveAttribute("multiple");
    });
  });
});
