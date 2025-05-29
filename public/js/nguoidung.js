let originalValues = {};

function editField(fieldName) {
  const displayElement = document.getElementById(`${fieldName}-display`);
  originalValues[fieldName] = displayElement.textContent;
  displayElement.style.display = 'none';
  document.getElementById(`${fieldName}-input`).style.display = 'block';
  document.getElementById(`${fieldName}-input`).value = originalValues[fieldName];
  document.getElementById(`save-${fieldName}`).style.display = 'inline-block';
  document.getElementById(`cancel-${fieldName}`).style.display = 'inline-block';
  event.target.style.display = 'none';
}

function cancelEdit(fieldName) {
  document.getElementById(`${fieldName}-display`).textContent = originalValues[fieldName];
  document.getElementById(`${fieldName}-display`).style.display = 'inline';
  document.getElementById(`${fieldName}-input`).style.display = 'none';
  document.getElementById(`save-${fieldName}`).style.display = 'none';
  document.getElementById(`cancel-${fieldName}`).style.display = 'none';
  event.target.parentElement.querySelector('button:not([id^="save-"]):not([id^="cancel-"])').style.display = 'inline-block';
}

document.addEventListener("DOMContentLoaded", () => {
  loadUserInfo();
  document.getElementById("change-password")?.addEventListener("click", handleChangePassword);
});

async function loadUserInfo() {
  try {
    const response = await fetch("/api/user/info", { credentials: "include" });
    if (!response.ok) throw new Error("Không thể lấy thông tin người dùng");
    const user = await response.json();
    document.getElementById("username-display").textContent = user.username;
    document.getElementById("email-display").textContent = user.email;
    document.getElementById("username-input").value = user.username;
    document.getElementById("email-input").value = user.email;
  } catch (err) {
    console.error(err);
    alert("Lỗi khi tải thông tin người dùng");
  }
}

async function saveField(field) {
  const input = document.getElementById(`${field}-input`);
  const value = input.value.trim();
  if (!value) {
    alert(`Vui lòng nhập ${field === 'username' ? 'tên người dùng' : 'email'}`);
    return;
  }
  try {
    const response = await fetch("/api/user/update", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Lỗi server (mã ${response.status})`);
    }
    alert("Cập nhật thành công!");
    location.reload();
  } catch (err) {
    alert(err.message);
    input.focus();
  }
}





async function handleChangePassword() {
  try {
    const oldPassword = await showPasswordForm("Nhập mật khẩu cũ:");
    if (!oldPassword) return;

    const newPassword = await showPasswordForm("Nhập mật khẩu mới:");
    if (!newPassword) return;
    const response = await fetch("/api/user/password", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword, newPassword })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Đổi mật khẩu thất bại");

    alert(data.message || "Đổi mật khẩu thành công");
  } catch (err) {
    console.error("Lỗi đổi mật khẩu:", err);
    alert(err.message);
  }
}


function showPasswordForm(title) {
  return new Promise((resolve) => {
    if (document.querySelector(".password-form")) return;

    const form = document.createElement("div");
    form.className = "password-form";
    form.innerHTML = `
      <label>${title}</label>
      <input type="password">
      <button type="button">Xác nhận</button>
      <button type="button">Hủy</button>
    `;

    document.body.appendChild(form);
    const [input, confirmBtn, cancelBtn] = form.querySelectorAll("input, button");

    confirmBtn.onclick = () => {
      if (input.value.trim()) {
        document.body.removeChild(form);
        resolve(input.value.trim());
      }
    };

    cancelBtn.onclick = () => {
      document.body.removeChild(form);
      resolve(null);
    };
  });
}

