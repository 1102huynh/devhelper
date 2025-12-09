package com.devhelper.config;

import com.devhelper.model.Note;
import com.devhelper.model.SshCommand;
import com.devhelper.repository.NoteRepository;
import com.devhelper.repository.SshCommandRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(SshCommandRepository sshRepo, NoteRepository noteRepo) {
        return args -> {
            // Initialize SSH Commands
            sshRepo.save(createSshCommand(
                "SSH into server",
                "ssh user@hostname -p 22",
                "Connect to remote server via SSH",
                "Connection"
            ));

            sshRepo.save(createSshCommand(
                "SSH with key",
                "ssh -i ~/.ssh/id_rsa user@hostname",
                "Connect using SSH key authentication",
                "Connection"
            ));

            sshRepo.save(createSshCommand(
                "Copy file to server",
                "scp /local/file.txt user@hostname:/remote/path/",
                "Copy file from local to remote server",
                "File Transfer"
            ));

            sshRepo.save(createSshCommand(
                "Copy file from server",
                "scp user@hostname:/remote/file.txt /local/path/",
                "Copy file from remote server to local",
                "File Transfer"
            ));

            sshRepo.save(createSshCommand(
                "SSH tunnel",
                "ssh -L 8080:localhost:80 user@hostname",
                "Create SSH tunnel for port forwarding",
                "Tunneling"
            ));

            sshRepo.save(createSshCommand(
                "Execute remote command",
                "ssh user@hostname 'ls -la /var/www'",
                "Execute command on remote server",
                "Remote Execution"
            ));

            sshRepo.save(createSshCommand(
                "Check disk usage",
                "ssh user@hostname 'df -h'",
                "Check disk space on remote server",
                "Monitoring"
            ));

            sshRepo.save(createSshCommand(
                "Restart service",
                "ssh user@hostname 'sudo systemctl restart nginx'",
                "Restart service on remote server",
                "System Admin"
            ));

            sshRepo.save(createSshCommand(
                "View logs",
                "ssh user@hostname 'tail -f /var/log/application.log'",
                "Stream logs from remote server",
                "Monitoring"
            ));

            sshRepo.save(createSshCommand(
                "Copy directory",
                "scp -r /local/dir user@hostname:/remote/path/",
                "Recursively copy directory to remote server",
                "File Transfer"
            ));

            // Initialize Notes
            noteRepo.save(createNote(
                "Welcome to Dev Helper",
                "This is your quick notes area. Press Ctrl+Space to quickly add notes!",
                "welcome,getting-started",
                true
            ));

            noteRepo.save(createNote(
                "Regex Pattern Examples",
                "Email: ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$\nURL: https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b",
                "regex,reference",
                true
            ));

            noteRepo.save(createNote(
                "Common Git Commands",
                "git status\ngit add .\ngit commit -m \"message\"\ngit push origin main\ngit pull\ngit branch -a",
                "git,commands",
                false
            ));

            noteRepo.save(createNote(
                "Docker Quick Reference",
                "docker ps\ndocker images\ndocker build -t name .\ndocker run -p 8080:80 image\ndocker-compose up -d",
                "docker,reference",
                false
            ));

            noteRepo.save(createNote(
                "API Testing Tips",
                "- Always check response status codes\n- Validate response schema\n- Test error scenarios\n- Check response times\n- Use proper authentication",
                "api,testing,tips",
                false
            ));

            noteRepo.save(createNote(
                "JSON Formatting Shortcuts",
                "Ctrl+Shift+F - Format\nCtrl+Shift+M - Minify\nCtrl+Shift+V - Validate",
                "json,shortcuts",
                false
            ));

            System.out.println("✅ Sample data initialized successfully!");
        };
    }

    private SshCommand createSshCommand(String name, String command, String description, String category) {
        SshCommand cmd = new SshCommand();
        cmd.setName(name);
        cmd.setCommand(command);
        cmd.setDescription(description);
        cmd.setCategory(category);
        return cmd;
    }

    private Note createNote(String title, String content, String tags, boolean pinned) {
        Note note = new Note();
        note.setTitle(title);
        note.setContent(content);
        note.setTags(tags);
        note.setPinned(pinned);
        return note;
    }
}

