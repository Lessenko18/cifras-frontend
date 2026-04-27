import styled from "styled-components";

export const InputComponent = styled.input`
  border: 1px solid var(--border-color);
  border-radius: 5px;
  box-shadow: 0 0 3px #21212168;
  padding: 5px 10px;
  max-width: 400px;
  background: var(--bg-input);
  color: var(--text-primary);

  &::placeholder {
    color: var(--text-muted);
  }
`;
