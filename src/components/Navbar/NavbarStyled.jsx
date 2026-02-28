import styled from "styled-components";

export const NavContainer = styled.nav`
  max-width: 1200px;
  width: 100%;
  margin: 15px auto 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  background-image: url("/fundoviolao.PNG");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center 42%;
  padding: 10px 20px;
  border-radius: 10px;
  overflow: visible;

  #logo {
    max-width: 250px;
    filter: drop-shadow(0 2px 2px #0000007b);
  }

  @media only screen and (max-width: 420px) {
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 12px 12px 16px;
  }
`;
export const NavContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 15px;
  color: var(--light);
  align-items: center;
  padding: 20px 0;
  margin-left: auto;

  @media only screen and (max-width: 528px) {
    padding-top: 0;
  }

  @media only screen and (max-width: 420px) {
    width: 100%;
    justify-content: center;
    gap: 10px;
    padding: 6px 0 0;
  }
`;

export const UserArea = styled.div`
  position: relative;
  z-index: 1000;
  display: flex;
  align-items: center;

  .perfil-btn {
    display: block;
    width: 100%;
    padding: 8px 10px;
    border: 1px solid transparent;
    border-radius: 6px;
    color: var(--dark);
    text-decoration: none;
    font-weight: 600;
    transition:
      background-color 0.2s ease,
      color 0.2s ease,
      border-color 0.2s ease,
      transform 0.15s ease;

    &:hover {
      background-color: var(--gray);
      color: var(--main);
      border-color: var(--gray);
      transform: translateY(-1px);
    }
  }

  .user-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--light);
  }

  img {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    object-fit: cover;
  }

  @media only screen and (max-width: 420px) {
    .user-btn {
      gap: 6px;
    }

    img {
      width: 42px;
      height: 42px;
    }

    .initials {
      width: 32px;
      height: 32px;
      font-size: 14px;
    }
  }

  .initials {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--light);
    color: var(--main);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
  }

  .user-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: var(--light);
    color: var(--dark);
    border-radius: 8px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    padding: 12px;
    min-width: 290px;
    z-index: 2000;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .user-info {
    display: flex;
    gap: 8px;
    align-items: center;
    border-bottom: 1px solid rgba(0, 0, 0, 0.07);
    padding-bottom: 8px;
    margin-bottom: 8px;
  }

  .user-info img {
    width: 56px;
    height: 56px;
  }

  .initials.big {
    width: 56px;
    height: 56px;
    font-size: 18px;
  }

  .meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 14px;
    flex: 1;
    min-width: 0;
  }

  .meta span {
    overflow-wrap: anywhere;
  }

  .logout-btn {
    background: var(--main);
    color: var(--light);
    border: none;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 4px;
  }
`;
