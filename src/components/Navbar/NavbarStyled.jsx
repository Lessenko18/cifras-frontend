import styled from "styled-components";

export const NavContainer = styled.nav`
  max-width: 1200px;
  width: 100%;
  margin: 15px auto 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  background: linear-gradient(to right, var(--dark), var(--main));
  padding: 0 20px;
  border-radius: 10px;
  #logo {
    max-width: 110px;
    filter: drop-shadow(0 2px 2px #0000007b);
  }
`;
export const NavContent = styled.div`
  display: flex;
  gap: 15px;
  color: var(--light);
  align-items: center;
`;
